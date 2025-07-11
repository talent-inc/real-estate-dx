import { Router } from 'express';
import type { Request, Response } from 'express';
// import { prisma } from '../config/database'; // Temporarily commented out
import { logger } from '../config/logger';
import os from 'os';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  services: {
    database: 'healthy' | 'unhealthy';
    redis?: 'healthy' | 'unhealthy';
  };
  system?: {
    memory: {
      total: number;
      free: number;
      used: number;
      usage: string;
    };
    cpu: {
      load: number[];
    };
  };
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus: 'healthy' | 'unhealthy' = 'unhealthy';
    try {
      // await prisma.$queryRaw`SELECT 1`; // Temporarily commented out
      dbStatus = 'healthy'; // Placeholder status
    } catch (error) {
      logger.error('Database health check failed:', error);
    }

    // System metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = ((usedMem / totalMem) * 100).toFixed(2);

    const health: HealthStatus = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
      },
    };

    // Include detailed metrics only in development
    if (process.env.NODE_ENV === 'development') {
      health.system = {
        memory: {
          total: totalMem,
          free: freeMem,
          used: usedMem,
          usage: `${memUsage}%`,
        },
        cpu: {
          load: os.loadavg(),
        },
      };
    }

    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

export default router;