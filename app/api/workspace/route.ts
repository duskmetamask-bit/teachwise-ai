import { NextRequest, NextResponse } from 'next/server';
import { mergeWorkspaceSnapshot, readWorkspaceSnapshot } from '@/app/lib/server/workspaceStore';

export async function GET() {
  try {
    const snapshot = await readWorkspaceSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('Workspace read error:', error);
    return NextResponse.json({ error: 'Unable to load workspace' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const partial = await req.json();
    const snapshot = await mergeWorkspaceSnapshot(partial);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('Workspace write error:', error);
    return NextResponse.json({ error: 'Unable to save workspace' }, { status: 500 });
  }
}
