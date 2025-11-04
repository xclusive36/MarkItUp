import { NextResponse } from 'next/server';
import { getSyncService } from '@/lib/db/sync';

/**
 * Database initialization and sync API
 *
 * POST /api/db/init - Initialize database from file system
 * GET /api/db/stats - Get sync statistics
 */
export async function POST() {
  try {
    console.log('[DB Init] Starting database initialization...');

    const syncService = getSyncService();
    await syncService.initialize();

    const stats = await syncService.getStats();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      stats,
    });
  } catch (error) {
    console.error('[DB Init] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const syncService = getSyncService();
    const stats = await syncService.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[DB Stats] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
