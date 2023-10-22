import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.provider';

@Injectable()
export class RedisService {
  public constructor(
    @Inject('REDIS_CLIENT')
    public readonly redisClient: RedisClient,
  ) {}

  async setKeyAddOne(key: string): Promise<boolean> {
    const result = await this.redisClient.setnx(key, 1);
    return result === 1;
  }

  async delKey(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key);
    return result === 1;
  }

  async setValue(key: string, value: string, expirationSeconds: number) {
    return await this.redisClient.set(key, value, 'EX', expirationSeconds);
  }

  async getValue(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async hset(
    hashkey: string,
    field: string,
    value: string | number | Buffer,
  ): Promise<number> {
    return await this.redisClient.hset(hashkey, field, value);
  }

  async hget(hash: string, field: string): Promise<string | null> {
    const value = await this.redisClient.hget(hash, field);
    return value;
  }
}
