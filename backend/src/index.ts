import { createApp } from './app';
import { config } from './config/environment';
import { prisma } from './config/database';

async function main() {
  try {
    console.log('🚀 Starting Crowdfunding Platform Backend...');
    console.log(`📊 Environment: ${config.nodeEnv}`);

    // Create Express app
    const app = await createApp();

    // Database connection check
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');

    // Start server
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      console.log(`🎯 Server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
