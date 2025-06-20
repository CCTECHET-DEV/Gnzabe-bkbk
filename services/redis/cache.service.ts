import RedisClient from './redis.service';

export const clearCache = async (key: string): Promise<void> => {
  try {
    const redisInstance = await RedisClient.getInstance();
    const redisClient = redisInstance.getClient();
    await redisClient.del(key);
  } catch (error) {
    console.error('🔴 Redis cache clear error:', error);
  }
};
