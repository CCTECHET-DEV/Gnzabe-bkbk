import { createClient, RedisClientType } from 'redis';

// const redisClient = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379',
// });

// redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
// redisClient.on('connect', () => console.log('✅ Connected to Redis'));

// (async () => {
//   await redisClient.connect();
// })();

// export default redisClient;

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    this.client.on('error', (err: Error) =>
      console.error('❌ Redis Error:', err),
    );
    this.client.on('connect', () => console.log('✅ Connected to Redis'));
  }

  public static async getInstance(): Promise<RedisClient> {
    if (!RedisClient.instance) RedisClient.instance = new RedisClient();

    if (!RedisClient.instance.client.isOpen)
      await RedisClient.instance.client.connect();

    return RedisClient.instance;
  }

  public getClient(): RedisClientType {
    return this.client;
  }
  // public async connect() {
  //   if (!this.client.isOpen) {
  //     await this.client.connect();
  //   }
  // }
}

export default RedisClient;
