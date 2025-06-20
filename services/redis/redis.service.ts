import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis'));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
