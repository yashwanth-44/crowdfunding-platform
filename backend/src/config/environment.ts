import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-key',
    expiresIn: process.env.JWT_EXPIRY || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  // S3
  s3: {
    bucket: process.env.S3_BUCKET || 'crowdfunding-bucket',
    region: process.env.S3_REGION || 'us-east-1',
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    usePathStyleUrl: process.env.S3_USE_PATH_STYLE_URL === 'true',
  },

  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
