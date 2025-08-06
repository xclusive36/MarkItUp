import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

// Ensure the markdown directory exists
if (!fs.existsSync(MARKDOWN_DIR)) {
  fs.mkdirSync(MARKDOWN_DIR, { recursive: true });
}

export async function GET() {
  try {
    // Recursively find markdown files and convert to Note objects
    function findNotesRecursive(dir: string, folderPrefix: string = ''): Note[] {
      let results: Note[] = [];
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          results = results.concat(findNotesRecursive(itemPath, path.join(folderPrefix, item)));
        } else if (item.endsWith('.md')) {
          const content = fs.readFileSync(itemPath, 'utf-8');
          const parsed = MarkdownParser.parseNote(content);
          const wordCount = MarkdownParser.calculateWordCount(content);
          const readingTime = MarkdownParser.calculateReadingTime(wordCount);
          
          const note: Note = {
            id: MarkdownParser.generateNoteId(item.replace('.md', ''), folderPrefix || undefined),
            name: item,
            content,
            folder: folderPrefix || undefined,
            createdAt: stats.ctime.toISOString(),
            updatedAt: stats.mtime.toISOString(),
            tags: parsed.tags,
            metadata: parsed.frontmatter,
            wordCount,
            readingTime
          };
          
          results.push(note);
        }
      }
      return results;
    }
    
    const notes = findNotesRecursive(MARKDOWN_DIR, '').sort((a: Note, b: Note) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return NextResponse.json(notes);
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
