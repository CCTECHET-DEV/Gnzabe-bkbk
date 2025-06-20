import redisClient from './redis.service';

// export const getOrSetCache = async <T>(
//   key: string,
//   cb: () => Promise<T>,
//   ttlSeconds = 60,
// ): Promise<T> => {
//   try {
//     const cached = await redisClient.get(key);
//     if (cached) {
//       return JSON.parse(cached);
//     }
//     const freshData = await cb();
//     await redisClient.set(key, JSON.stringify(freshData), { EX: ttlSeconds });
//     return freshData;
//   } catch (error) {
//     console.error('🔴 Redis cache error:', error);
//     return cb(); // Fallback to fetching fresh data
//   }
// };

export const clearCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('🔴 Redis cache clear error:', error);
  }
};
