import { createClient, RedisClientType } from 'redis';
import { config } from './environment';

let redis: RedisClientType | null = null;

export async function initializeRedis(): Promise<RedisClientType> {
  if (redis) {
    return redis;
  }

  redis = createClient({ url: config.redis.url });

  redis.on('error', (err: Error) => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });

  await redis.connect();
  return redis;
}

export function getRedisClient(): RedisClientType {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

// Cache utilities
export const cacheKeys = {
  campaign: (id: string) => `campaign:${id}`,
  campaigns: () => 'campaigns:list',
  campaignsByCategory: (category: string) => `campaigns:${category}`,
  loan: (id: string) => `loan:${id}`,
  user: (id: string) => `user:${id}`,
  userSession: (userId: string, token: string) => `session:${userId}:${token}`,
};

const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 900, // 15 minutes
  LONG: 3600, // 1 hour
};

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttl = CACHE_TTL.MEDIUM
): Promise<void> {
  const client = getRedisClient();
  await client.setEx(key, ttl, JSON.stringify(value));
}

export async function cacheDelete(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
}
