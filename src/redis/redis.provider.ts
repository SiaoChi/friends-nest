import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export type RedisClient = Redis;

export const redisProvider: Provider = {
  provide: 'REDIS_CLIENT',

  useFactory: async (): Promise<RedisClient> => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
    const redisClient = new Redis({
      host: host,
      port: port,
    });
    try {
      await redisClient.ping();
      console.log('Redis is connected...');
      return redisClient;
    } catch (error) {
      console.error('Redis failed to connect...:', error.message);
      throw error;
    }
  },
};
