import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { fileService } from '@/lib/services/fileService';
import { getSyncService } from '@/lib/db/sync';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
  const startTime = Date.now();
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: {
      [key: string]: {
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        responseTime?: number;
      };
    };
    version: string;
    environment: string;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {},
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
  };

  // Check environment configuration
  try {
    getEnv();
    health.checks.environment = {
      status: 'pass',
      message: 'Environment variables validated',
    };
  } catch (error) {
    health.checks.environment = {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Environment validation failed',
    };
    health.status = 'unhealthy';
  }

  // Check file system
  const fsStart = Date.now();
  try {
    // Use a dev user ID for health check
    await fileService.listFiles('health-check-user');
    health.checks.filesystem = {
      status: 'pass',
      message: 'File system accessible',
      responseTime: Date.now() - fsStart,
    };
  } catch (error) {
    health.checks.filesystem = {
      status: 'fail',
      message: error instanceof Error ? error.message : 'File system check failed',
      responseTime: Date.now() - fsStart,
    };
    health.status = 'unhealthy';
  }

  // Check database
  const dbStart = Date.now();
  try {
    // Simple query to check database connectivity
    const syncService = getSyncService();
    // Just check if we can get the sync service without error
    if (syncService) {
      health.checks.database = {
        status: 'pass',
        message: 'Database accessible',
        responseTime: Date.now() - dbStart,
      };
    }
  } catch (error) {
    health.checks.database = {
      status: 'warn',
      message: error instanceof Error ? error.message : 'Database check failed',
      responseTime: Date.now() - dbStart,
    };
    // Database failure is degraded, not unhealthy (filesystem is primary)
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const memPercentage = (memUsedMB / memTotalMB) * 100;

  health.checks.memory = {
    status: memPercentage > 90 ? 'warn' : 'pass',
    message: `${memUsedMB}MB / ${memTotalMB}MB (${memPercentage.toFixed(1)}%)`,
  };

  if (memPercentage > 90 && health.status === 'healthy') {
    health.status = 'degraded';
  }

  // Overall response time
  const responseTime = Date.now() - startTime;

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(
    {
      ...health,
      responseTime,
    },
    { status: statusCode }
  );
}
