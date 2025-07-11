import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
// Note: Some imports are temporarily commented out due to dependency installation issues
// import helmet from 'helmet';
// import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware';
// import { rateLimiter } from './middlewares/rateLimit.middleware';
import { requestLogger } from './middlewares/logger.middleware';
// import { prisma } from './config/database';
import { logger } from './config/logger';
import { initializePassport } from './config/passport';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import propertyRoutes from './routes/property.routes';
import healthRoutes from './routes/health.routes';
import uploadRoutes from './routes/upload.routes';
import inquiryRoutes from './routes/inquiry.routes';
import externalSystemRoutes from './routes/external-system.routes';
import analyticsRoutes from './routes/analytics.routes';
import testDataRoutes from './routes/test-data.routes';
import { TestDataService } from './services/test-data.service';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Passport
initializePassport();

// Global middlewares
// app.use(helmet()); // Temporarily commented out
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(requestLogger);
// app.use(rateLimiter); // Temporarily commented out

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/external-systems', externalSystemRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test data routes (development only)
if (process.env.USE_DEV_DATA === 'true') {
  app.use('/api/test-data', testDataRoutes);
}

// Error handling
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // await prisma.$disconnect(); // Temporarily commented out
  // logger.info('Database connection closed');
  
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  logger.info(`🚀 API Server is running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 CORS Origin: ${process.env.CORS_ORIGIN}`);
  
  // Initialize test data in development mode
  if (process.env.USE_DEV_DATA === 'true') {
    try {
      await TestDataService.initialize();
      logger.info('✅ Test data initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize test data:', error);
    }
  }
});