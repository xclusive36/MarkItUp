import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

function safeJoinMarkdownDir(filename: string): string | null {
  const filePath = path.resolve(MARKDOWN_DIR, filename);
  if (!filePath.startsWith(MARKDOWN_DIR)) return null;
  return filePath;
}

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json();
    if (typeof from !== 'string' || typeof to !== 'string') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    const fromPath = safeJoinMarkdownDir(from);
    const toPath = safeJoinMarkdownDir(to);
    if (!fromPath || !toPath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    if (!fs.existsSync(fromPath)) {
      return NextResponse.json({ error: 'Source does not exist' }, { status: 404 });
    }
    // Prevent moving a folder into itself or its descendants
    if (fromPath === toPath || toPath.startsWith(fromPath + path.sep)) {
      return NextResponse.json(
        { error: 'Cannot move a folder into itself or its descendants' },
        { status: 400 }
      );
    }
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.renameSync(fromPath, toPath);
    return NextResponse.json({ message: 'Moved successfully' });
  } catch (error: any) {
    console.error('Error moving file/folder:', error);
    return NextResponse.json(
      { error: 'Failed to move', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
