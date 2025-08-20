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
    const { sourceName, targetName, folder } = await request.json();
    if (!sourceName || !targetName) {
      return NextResponse.json(
        { error: 'Both sourceName and targetName are required' },
        { status: 400 }
      );
    }
    const sourcePath = safeJoinMarkdownDir(folder ? path.join(folder, sourceName) : sourceName);
    const targetPath = safeJoinMarkdownDir(folder ? path.join(folder, targetName) : targetName);
    if (!sourcePath || !targetPath) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json({ error: 'Source file does not exist' }, { status: 404 });
    }
    if (fs.existsSync(targetPath)) {
      return NextResponse.json({ error: 'Target file already exists' }, { status: 409 });
    }
    fs.copyFileSync(sourcePath, targetPath);
    return NextResponse.json({ message: 'File duplicated successfully' });
  } catch (error) {
    console.error('Error duplicating file:', error);
    return NextResponse.json({ error: 'Failed to duplicate file' }, { status: 500 });
  }
}
