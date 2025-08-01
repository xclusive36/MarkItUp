import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join(MARKDOWN_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    
    return NextResponse.json({
      name: filename,
      content,
      createdAt: stats.ctime.toISOString(),
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join(MARKDOWN_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    // Remove empty parent folders up to MARKDOWN_DIR
    let dir = path.dirname(filePath);
    while (dir !== MARKDOWN_DIR) {
      const files = fs.readdirSync(dir);
      // Only remove if no files or folders left
      if (files.length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      } else {
        break;
      }
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
