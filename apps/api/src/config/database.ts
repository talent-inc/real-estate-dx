import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Extend PrismaClient with middleware
const prismaClientSingleton = (): PrismaClient => {
  const prisma = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  // Log database queries in development
  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
      logger.debug('Query:', {
        query: e.query,
        params: e.params,
        duration: e.duration,
      });
    });
  }

  // Log errors
  prisma.$on('error', (e) => {
    logger.error('Database error:', e);
  });

  // Log warnings
  prisma.$on('warn', (e) => {
    logger.warn('Database warning:', e);
  });

  // Middleware for multi-tenant isolation
  prisma.$use(async (params, next) => {
    // Add tenant isolation logic here
    // This will be implemented when we add authentication context
    
    const result = await next(params);
    return result;
  });

  return prisma;
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    return false;
  }
};