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
    const { oldName, newName, folder } = await request.json();
    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Both oldName and newName are required' }, { status: 400 });
    }
    const oldPath = safeJoinMarkdownDir(folder ? path.join(folder, oldName) : oldName);
    const newPath = safeJoinMarkdownDir(folder ? path.join(folder, newName) : newName);
    if (!oldPath || !newPath) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ error: 'Original file does not exist' }, { status: 404 });
    }
    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: 'Target file already exists' }, { status: 409 });
    }
    fs.renameSync(oldPath, newPath);
    return NextResponse.json({ message: 'File renamed successfully' });
  } catch (error) {
    console.error('Error renaming file:', error);
    return NextResponse.json({ error: 'Failed to rename file' }, { status: 500 });
  }
}
