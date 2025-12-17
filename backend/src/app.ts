import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import { config } from './config/environment';
import { initializeRedis } from './config/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import campaignRoutes from './routes/campaign.routes';
import donationRoutes from './routes/donation.routes';
import loanRoutes from './routes/loan.routes';
import adminRoutes from './routes/admin.routes';

export async function createApp(): Promise<Express> {
  const app = express();

  // Initialize Redis
  await initializeRedis();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging (development only)
  if (config.isDev) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
