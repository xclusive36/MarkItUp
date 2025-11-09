import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';

const DAILY_NOTES_DIR = path.join(process.cwd(), 'markdown', 'journal');

// Ensure journal directory exists
function ensureJournalDir() {
  if (!fs.existsSync(DAILY_NOTES_DIR)) {
    fs.mkdirSync(DAILY_NOTES_DIR, { recursive: true });
  }
}

// Generate daily note template
function getDailyNoteTemplate(date: string): string {
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return `# ${dayName}, ${date}

## 📝 Notes


## ✅ Tasks

- [ ] 


## 🎯 Goals


## 💭 Reflections


## 🔗 Links

`;
}

// POST - Create daily note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, content } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    ensureJournalDir();

    const fileName = `${date}.md`;
    const filePath = path.join(DAILY_NOTES_DIR, fileName);

    // Atomic create: open with exclusive flag to avoid race (TOCTOU safe)
    try {
      const handle = await fsp.open(filePath, 'wx');
      try {
        const noteContent = content || getDailyNoteTemplate(date);
        await handle.writeFile(noteContent, { encoding: 'utf-8' });
      } finally {
        await handle.close();
      }
    } catch (createErr: any) {
      if (createErr && createErr.code === 'EEXIST') {
        return NextResponse.json(
          { error: 'Daily note already exists', path: `journal/${fileName}` },
          { status: 409 }
        );
      }
      console.error('Daily note atomic create failed:', createErr);
      return NextResponse.json({ error: 'Failed to create daily note' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      path: `journal/${fileName}`,
      date,
    });
  } catch (error) {
    console.error('Error creating daily note:', error);
    return NextResponse.json({ error: 'Failed to create daily note' }, { status: 500 });
  }
}

// GET - Get daily note info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');

    if (!date) {
      // Return list of all daily notes
      ensureJournalDir();

      const files = fs
        .readdirSync(DAILY_NOTES_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));

      return NextResponse.json({
        dates: files,
        count: files.length,
      });
    }

    // Get specific daily note
    const fileName = `${date}.md`;
    const filePath = path.join(DAILY_NOTES_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        exists: false,
        date,
      });
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    return NextResponse.json({
      exists: true,
      date,
      path: `journal/${fileName}`,
      content,
    });
  } catch (error) {
    console.error('Error getting daily note:', error);
    return NextResponse.json({ error: 'Failed to get daily note' }, { status: 500 });
  }
}
