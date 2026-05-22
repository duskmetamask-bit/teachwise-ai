import { NextResponse } from 'next/server';

type MiniMaxContentPart = {
  type?: string;
  text?: string;
};

export function extractTextContent(content: unknown): string {
  if (!Array.isArray(content)) {
    return String(content);
  }

  const textParts: string[] = [];
  for (const item of content as MiniMaxContentPart[]) {
    if (item.type === 'text' && item.text) {
      textParts.push(item.text);
    }
  }
  return textParts.join('\n\n');
}

export async function callMiniMax({
  system,
  prompt,
  maxTokens = 4096,
  temperature = 0.5,
  model = 'MiniMax-M2.7',
}: {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}) {
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'MINIMAX_API_KEY not set' }, { status: 500 });
  }

  const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  return response;
}

