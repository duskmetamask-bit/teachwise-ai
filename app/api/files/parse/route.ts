import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function parsePdf(buffer: Buffer) {
  const mod = await import('pdf-parse');
  const pdfParse = (mod as unknown as { default: (data: Buffer) => Promise<{ text: string }> }).default;
  const result = await pdfParse(buffer);
  return result.text || '';
}

async function parseDocx(buffer: Buffer) {
  const mod = await import('mammoth');
  const mammoth = mod as unknown as { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }> };
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();

    let text = '';
    if (name.endsWith('.txt')) {
      text = buffer.toString('utf8');
    } else if (name.endsWith('.pdf')) {
      text = await parsePdf(buffer);
    } else if (name.endsWith('.docx')) {
      text = await parseDocx(buffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('File parse error:', error);
    return NextResponse.json({ error: 'Could not parse file' }, { status: 500 });
  }
}

