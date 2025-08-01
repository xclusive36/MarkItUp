import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

// Ensure the markdown directory exists
if (!fs.existsSync(MARKDOWN_DIR)) {
  fs.mkdirSync(MARKDOWN_DIR, { recursive: true });
}

export async function GET() {
  try {
    // Recursively find markdown files in all subfolders
    interface MarkdownFile {
      name: string;
      folder: string;
      content: string;
      createdAt: string;
    }
    function findMarkdownFiles(dir: string, folderPrefix: string = ''): MarkdownFile[] {
      let results: MarkdownFile[] = [];
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const relFolder = folderPrefix;
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          results = results.concat(findMarkdownFiles(itemPath, path.join(folderPrefix, item)));
        } else if (item.endsWith('.md')) {
          const content = fs.readFileSync(itemPath, 'utf-8');
          results.push({
            name: item,
            folder: folderPrefix,
            content,
            createdAt: stats.ctime.toISOString(),
          });
        }
      }
      return results;
    }
    const markdownFiles = findMarkdownFiles(MARKDOWN_DIR, '').sort((a: MarkdownFile, b: MarkdownFile) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(markdownFiles);
  } catch (error) {
    console.error('Error reading files:', error);
    return NextResponse.json({ error: 'Failed to read files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, content, folder } = await request.json();

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    // Ensure the filename ends with .md
    const fileName = name.endsWith('.md') ? name : `${name}.md`;
    // If folder is provided, save in nested folder
    const targetDir = folder ? path.join(MARKDOWN_DIR, folder) : MARKDOWN_DIR;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const filePath = path.join(targetDir, fileName);

    fs.writeFileSync(filePath, content, 'utf-8');

    return NextResponse.json({ 
      message: 'File saved successfully',
      fileName,
      folder: folder || '',
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
