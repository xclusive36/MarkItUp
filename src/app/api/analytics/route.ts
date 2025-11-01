import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ANALYTICS_DIR = path.join(process.cwd(), 'analytics');
const EVENTS_FILE = path.join(ANALYTICS_DIR, 'events.json');

// Ensure analytics directory exists
async function ensureAnalyticsDir() {
  try {
    await fs.access(ANALYTICS_DIR);
  } catch {
    await fs.mkdir(ANALYTICS_DIR, { recursive: true });
  }
}

// GET - Retrieve analytics events
export async function GET(request: NextRequest) {
  try {
    await ensureAnalyticsDir();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const type = searchParams.get('type');
    const days = searchParams.get('days');

    let events = [];

    try {
      const data = await fs.readFile(EVENTS_FILE, 'utf-8');
      events = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, return empty array
      events = [];
    }

    // Filter by type if specified
    if (type) {
      events = events.filter((event: any) => event.type === type);
    }

    // Filter by days if specified
    if (days) {
      const daysNum = parseInt(days);
      const cutoff = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
      events = events.filter((event: any) => new Date(event.timestamp) >= cutoff);
    }

    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit);
      events = events.slice(-limitNum); // Get most recent events
    }

    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    console.error('Error retrieving analytics events:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics events' }, { status: 500 });
  }
}

// POST - Store analytics event
export async function POST(request: NextRequest) {
  try {
    await ensureAnalyticsDir();

    // Check if request has a body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      console.warn('Analytics POST received empty body');
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    let eventData;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        console.warn('Analytics POST received empty text body');
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      eventData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse analytics POST body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: String(parseError) },
        { status: 400 }
      );
    }

    console.log('Analytics POST eventData:', eventData);

    // Validate required fields
    if (!eventData.type || !eventData.timestamp) {
      console.error('Analytics event missing required fields:', eventData);
      return NextResponse.json(
        { error: 'Missing required fields: type, timestamp', received: eventData },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    if (!eventData.id) {
      eventData.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Load existing events
    let events = [];
    try {
      const data = await fs.readFile(EVENTS_FILE, 'utf-8');
      events = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      events = [];
    }

    // Add new event
    events.push(eventData);

    // Keep only last 10000 events to prevent file from growing too large
    if (events.length > 10000) {
      events = events.slice(-10000);
    }

    // Save events back to file
    await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));

    return NextResponse.json({ success: true, id: eventData.id });
  } catch (error) {
    console.error('Error storing analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics event', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Clear analytics data
export async function DELETE() {
  try {
    await ensureAnalyticsDir();

    // Clear events file
    await fs.writeFile(EVENTS_FILE, JSON.stringify([], null, 2));

    return NextResponse.json({ success: true, message: 'Analytics data cleared' });
  } catch (error) {
    console.error('Error clearing analytics data:', error);
    return NextResponse.json({ error: 'Failed to clear analytics data' }, { status: 500 });
  }
}
