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
    const files = fs.readdirSync(MARKDOWN_DIR);
    const markdownFiles = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(MARKDOWN_DIR, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        return {
          name: file,
          content,
          createdAt: stats.ctime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(markdownFiles);
  } catch (error) {
    console.error('Error reading files:', error);
    return NextResponse.json({ error: 'Failed to read files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, content } = await request.json();
    
    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    // Ensure the filename ends with .md
    const fileName = name.endsWith('.md') ? name : `${name}.md`;
    const filePath = path.join(MARKDOWN_DIR, fileName);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    
    return NextResponse.json({ 
      message: 'File saved successfully',
      fileName 
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
