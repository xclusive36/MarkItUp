import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ORDER_FILE = path.join(process.cwd(), 'markdown', '.order.json');

export async function PUT(request: NextRequest) {
  try {
    const notes = await request.json();
    if (!Array.isArray(notes)) {
      return NextResponse.json({ error: 'Invalid notes array' }, { status: 400 });
    }
    fs.writeFileSync(ORDER_FILE, JSON.stringify(notes, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Order saved' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(ORDER_FILE)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(ORDER_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read order' }, { status: 500 });
  }
}
