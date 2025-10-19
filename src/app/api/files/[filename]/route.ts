// Prevent dynamic route from catching static routes like /move, /order, etc.
const RESERVED = ['move', 'order', 'rename', 'duplicate'];

function isReserved(filename: string) {
  // Handles both string and array (if catch-all is ever used)
  if (Array.isArray(filename)) filename = filename[0];
  return RESERVED.includes(filename);
}
export async function PUT(request: NextRequest, { params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  if (isReserved(resolvedParams.filename)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { filename } = resolvedParams;
    const filePath = safeJoinMarkdownDir(filename);
    if (!filePath) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    const body = await request.json();
    const { content, overwrite } = body;
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid content' }, { status: 400 });
    }
    const fileExists = fs.existsSync(filePath);
    if (fileExists && !overwrite) {
      // Prompt user for overwrite confirmation
      return NextResponse.json(
        {
          error: 'File already exists',
          prompt: 'File exists. Are you sure you want to overwrite it?',
          requiresOverwrite: true,
        },
        { status: 409 }
      );
    }
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    console.log('[API PUT] Writing file:', filePath);
    console.log('[API PUT] Content length:', content.length);
    console.log('[API PUT] Content preview (last 200 chars):', content.slice(-200));

    fs.writeFileSync(filePath, content, 'utf-8');

    console.log('[API PUT] File written successfully');

    return NextResponse.json({ message: fileExists ? 'File overwritten' : 'File created' });
  } catch (error) {
    console.error('Error writing file:', error);
    return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MarkdownParser } from '@/lib/parser';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

function safeJoinMarkdownDir(filename: string): string | null {
  // Allow subfolders, but prevent traversal outside MARKDOWN_DIR
  const filePath = path.resolve(MARKDOWN_DIR, filename);
  if (!filePath.startsWith(MARKDOWN_DIR)) return null;
  return filePath;
}

export async function GET(request: NextRequest, { params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  if (isReserved(resolvedParams.filename)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { filename } = resolvedParams;
    const filePath = safeJoinMarkdownDir(filename);
    if (!filePath) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    // Parse for tags, word count, reading time
    const parsed = MarkdownParser.parseNote(content);
    const wordCount = MarkdownParser.calculateWordCount(content);
    const readingTime = MarkdownParser.calculateReadingTime(wordCount);
    return NextResponse.json({
      name: filename,
      content,
      createdAt: stats.ctime.toISOString(),
      tags: parsed.tags || [],
      wordCount,
      readingTime,
      updatedAt: stats.mtime.toISOString(),
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  if (isReserved(resolvedParams.filename)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { filename } = resolvedParams;
    const filePath = safeJoinMarkdownDir(filename);
    if (!filePath) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
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
