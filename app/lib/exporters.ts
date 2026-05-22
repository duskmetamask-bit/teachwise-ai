import type { MarkingResult, LessonBlock } from './types';

export type ExportContent = {
  title: string;
  subtitle?: string;
  sections: Array<{
    title: string;
    body?: string;
    bullets?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }>;
};

function fileStem(value: string) {
  return value
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80) || 'teachwise_export';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export function lessonBlocksToExportContent(title: string, blocks: LessonBlock[], subtitle?: string): ExportContent {
  return {
    title,
    subtitle,
    sections: blocks.map((block) => ({
      title: block.label,
      body: block.content || '(No content yet)',
    })),
  };
}

export function rubricTextToExportContent(
  title: string,
  markdown: string,
  table?: { headers: string[]; rows: string[][] },
  subtitle?: string
): ExportContent {
  const sections: ExportContent['sections'] = [];

  if (table) {
    sections.push({ title: 'Rubric table', table });
  } else {
    sections.push({
      title: 'Rubric body',
      body: markdown || '(No rubric content yet)',
    });
  }

  return { title, subtitle, sections };
}

export function markingResultToExportContent(
  title: string,
  result: Pick<MarkingResult, 'overallGrade' | 'criteria' | 'strengths' | 'areasForDevelopment' | 'nextSteps'>,
  studentLabel?: string
): ExportContent {
  return {
    title,
    subtitle: studentLabel ? `Student work: ${studentLabel}` : undefined,
    sections: [
      { title: 'Overall grade', body: result.overallGrade || 'Not graded yet' },
      {
        title: 'Criterion feedback',
        body: result.criteria.length
          ? result.criteria
              .map((criterion) => `${criterion.name} — ${criterion.grade}\n${criterion.feedback}`)
              .join('\n\n')
          : '(No criterion feedback yet)',
      },
      {
        title: 'Strengths',
        bullets: result.strengths.length ? result.strengths : ['(No strengths captured yet)'],
      },
      {
        title: 'Areas for development',
        bullets: result.areasForDevelopment.length ? result.areasForDevelopment : ['(No development areas captured yet)'],
      },
      {
        title: 'Next steps',
        bullets: result.nextSteps.length ? result.nextSteps : ['(No next steps captured yet)'],
      },
    ],
  };
}

function addWrappedText(params: {
  text: string;
  y: number;
  width: number;
  size: number;
  font: { widthOfTextAtSize: (value: string, size: number) => number; name?: string };
  lineHeight: number;
  marginBottom: number;
  draw: (line: string, lineY: number, indent?: number) => void;
}) {
  const { text, y, width, size, font, lineHeight, marginBottom, draw } = params;
  const paragraphs = text.split('\n');
  let cursorY = y;

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      cursorY -= lineHeight;
      continue;
    }

    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width) {
        current = candidate;
      } else {
        draw(current, cursorY);
        cursorY -= lineHeight;
        if (cursorY < marginBottom) return cursorY;
        current = word;
      }
    }

    if (current) {
      draw(current, cursorY);
      cursorY -= lineHeight;
    }

    if (cursorY < marginBottom) return cursorY;
  }

  return cursorY;
}

export async function exportTeachWiseDocx(content: ExportContent) {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = await import('docx');
  type DocxChild = InstanceType<typeof Paragraph> | InstanceType<typeof Table>;

  const children: DocxChild[] = [
    new Paragraph({
      children: [new TextRun({ text: content.title, bold: true, size: 50, color: '0B1324' })],
      heading: HeadingLevel.TITLE,
      spacing: { after: 160 },
    }),
  ];

  if (content.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: content.subtitle, size: 22, color: '5B6475' })],
        spacing: { after: 240 },
      })
    );
  }

  for (const section of content.sections) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.title, bold: true, size: 28, color: '0F172A' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 220, after: 120 },
      })
    );

    if (section.table) {
      const rows = [
        new TableRow({
          children: section.table.headers.map((header) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true, color: 'FFFFFF' })] })],
              shading: { fill: '19324D' },
            })
          ),
        }),
        ...section.table.rows.map((row) =>
          new TableRow({
            children: row.map((cell) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: cell || '', size: 20 })] })],
              })
            ),
          })
        ),
      ];
      children.push(
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'D7DDE7' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D7DDE7' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'D7DDE7' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'D7DDE7' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'D7DDE7' },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'D7DDE7' },
          },
        })
      );
    } else if (section.bullets?.length) {
      for (const bullet of section.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: bullet, size: 22, color: '2C3444' })],
            spacing: { after: 60 },
          })
        );
      }
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: section.body || '(No content yet)', size: 22, color: '2C3444' })],
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${fileStem(content.title)}.docx`);
}

export async function exportTeachWisePptx(content: ExportContent) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'TeachWise';
  pptx.company = 'TeachWise';
  pptx.subject = content.subtitle || content.title;
  pptx.title = content.title;

  for (let i = 0; i < content.sections.length; i += 1) {
    const section = content.sections[i];
    const slide = pptx.addSlide();
    slide.background = { color: 'F7FAFF' };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.42,
      line: { color: '4DD0C4', transparency: 100 },
      fill: { color: '0B1324' },
    });
    slide.addText(content.title, {
      x: 0.58,
      y: 0.48,
      w: 8.8,
      h: 0.42,
      fontFace: 'Aptos',
      fontSize: 12,
      color: '64748B',
    });
    slide.addText(section.title, {
      x: 0.58,
      y: 0.88,
      w: 12,
      h: 0.55,
      fontFace: 'Aptos Display',
      fontSize: 26,
      bold: true,
      color: '0F172A',
    });

    if (section.table) {
      const tableText = [
        section.table.headers.join(' | '),
        ...section.table.rows.map((row) => row.join(' | ')),
      ].join('\n\n');
      slide.addText(tableText, {
        x: 0.58,
        y: 1.65,
        w: 12,
        h: 5.4,
        fontFace: 'Aptos',
        fontSize: 12,
        color: '334155',
        margin: 0,
        fit: 'shrink',
      });
    } else {
      const body = section.bullets?.length
        ? section.bullets.map((bullet) => `• ${bullet}`).join('\n\n')
        : section.body || '(No content yet)';
      slide.addText(body, {
        x: 0.58,
        y: 1.62,
        w: 12,
        h: 5.6,
        fontFace: 'Aptos',
        fontSize: 14,
        color: '334155',
        breakLine: false,
        valign: 'top',
        margin: 0,
        fit: 'shrink',
      });
    }
  }

  const blob = await (pptx.write as unknown as (outputType: string) => Promise<Blob>)('blob');
  downloadBlob(blob as Blob, `${fileStem(content.title)}.pptx`);
}

export async function exportTeachWisePdf(content: ExportContent) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  const pageSize: [number, number] = [595.28, 841.89];
  const marginX = 48;
  const marginTop = 58;
  const marginBottom = 52;
  const pageHeight = pageSize[1];
  const bodyWidth = pageSize[0] - marginX * 2;
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const bodyBoldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage(pageSize);
  let cursorY = pageHeight - marginTop;

  const newPage = () => {
    page = pdf.addPage(pageSize);
    cursorY = pageHeight - marginTop;
  };

  const ensureSpace = (spaceNeeded: number) => {
    if (cursorY - spaceNeeded < marginBottom) {
      newPage();
    }
  };

  page.drawText(content.title, {
    x: marginX,
    y: cursorY,
    size: 24,
    font: titleFont,
    color: rgb(0.05, 0.09, 0.16),
  });
  cursorY -= 34;

  if (content.subtitle) {
    const wrapped = addWrappedText({
      text: content.subtitle,
      y: cursorY,
      width: bodyWidth,
      size: 11,
      font: bodyFont,
      lineHeight: 16,
      marginBottom,
      draw: (line, lineY) => page.drawText(line, { x: marginX, y: lineY, size: 11, font: bodyFont, color: rgb(0.36, 0.39, 0.45) }),
    });
    cursorY = wrapped - 10;
  }

  for (const section of content.sections) {
    ensureSpace(56);
    page.drawText(section.title, {
      x: marginX,
      y: cursorY,
      size: 15,
      font: bodyBoldFont,
      color: rgb(0.06, 0.16, 0.28),
    });
    cursorY -= 22;

    if (section.table) {
      const tableText = [
        section.table.headers.join(' | '),
        section.table.rows.map((row) => row.join(' | ')).join('\n'),
      ].join('\n');
      cursorY = addWrappedText({
      text: tableText,
      y: cursorY,
      width: bodyWidth,
      size: 10,
      font: bodyFont,
      lineHeight: 14,
      marginBottom,
      draw: (line, lineY) => page.drawText(line, { x: marginX, y: lineY, size: 10, font: bodyFont, color: rgb(0.17, 0.21, 0.28) }),
    }) - 10;
    } else if (section.bullets?.length) {
      for (const bullet of section.bullets) {
        ensureSpace(20);
        cursorY = addWrappedText({
          text: `• ${bullet}`,
          y: cursorY,
          width: bodyWidth,
          size: 11,
          font: bodyFont,
          lineHeight: 15,
          marginBottom,
          draw: (line, lineY) => page.drawText(line, { x: marginX, y: lineY, size: 11, font: bodyFont, color: rgb(0.17, 0.21, 0.28) }),
        }) - 2;
      }
    } else {
      cursorY = addWrappedText({
        text: section.body || '(No content yet)',
        y: cursorY,
        width: bodyWidth,
        size: 11,
        font: bodyFont,
        lineHeight: 15,
        marginBottom,
        draw: (line, lineY) => page.drawText(line, { x: marginX, y: lineY, size: 11, font: bodyFont, color: rgb(0.17, 0.21, 0.28) }),
      }) - 10;
    }
  }

  const bytes = await pdf.save();
  downloadBlob(new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' }), `${fileStem(content.title)}.pdf`);
}
