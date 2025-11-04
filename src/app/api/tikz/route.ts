import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'No TikZ content provided' }, { status: 400 });
    }

    // Return placeholder SVG for TikZ content
    const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="none" stroke="black" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">
        TikZ Preview
      </text>
    </svg>`;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  } catch (error) {
    console.error('Error processing TikZ:', error);
    return NextResponse.json({ error: 'Failed to process TikZ' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'TikZ API endpoint is running' });
}
