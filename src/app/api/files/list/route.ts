import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

interface FileItem {
  path: string;
  title: string;
}

function getAllMarkdownFiles(dir: string, baseDir: string = dir): FileItem[] {
  const files: FileItem[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Recursively get files from subdirectories
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (item.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      const title = item.replace('.md', '');
      files.push({
        path: relativePath,
        title,
      });
    }
  }

  return files;
}

export async function GET() {
  try {
    const files = getAllMarkdownFiles(MARKDOWN_DIR);

    return NextResponse.json({
      files,
      count: files.length,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
