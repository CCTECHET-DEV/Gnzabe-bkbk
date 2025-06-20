import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utilities/catchAsync';
import RedisClient from '../services/redis/redis.service';

// export const cacheMiddleware1 = (
//   keyGenerator: (req: Request) => string,
//   ttlSeconds = 60,
// ) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const key = keyGenerator(req);
//       const cachedData = await redisClient.get(key);
//       if (cachedData) {
//         // Return cached response
//         return res.status(200).json(JSON.parse(cachedData));
//       }
//       // Attach cache key & TTL to res.locals for use later in controller
//       res.locals.cacheKey = key;
//       res.locals.ttlSeconds = ttlSeconds;
//       next();
//     } catch (error) {
//       console.error('Cache middleware error:', error);
//       next();
//     }
//   };
// };

export const cachedMiddleware = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    console.log('Cache middleware triggered for:', req.originalUrl);
    const { key } = req.query;
    if (!key || typeof key !== 'string') return next();

    const redisInstance = await RedisClient.getInstance();
    const redisClient = redisInstance.getClient();

    const documents = await redisClient.get(key);
    if (documents)
      return res.status(200).json({
        status: 'success',
        data: {
          documents: JSON.parse(documents),
        },
      });
    console.log('Cache miss for key:', key);
    return next();
  },
);
