import { KVNamespace } from '@cloudflare/workers-types';
import { H3Event } from 'h3';
import { Redis } from '@upstash/redis/cloudflare.js';

export class AcStorage {
  private readonly kv: KVNamespace | undefined;
  private readonly redis: Redis | undefined;

  constructor(event: H3Event) {
    if (event.context.cloudflare?.env.KV) {
      this.kv = event.context.cloudflare.env.KV;
    } else {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }

  async get<T>(key: string): Promise<T> {
    try {
      const result = this.kv
        ? await this.kv.get(key, { type: 'json' }) as T
        : await this.redis?.get(key) as T;
      return result;
    } catch (e) {
      console.log(e);
      return null as unknown as T;
    }
  }

  async put(key: string, value: unknown, options?: {expirationTtl?: number}): Promise<void> {
    if (this.kv) {
      await this.kv.put(key, JSON.stringify(value), options);
    } else {
      const setOptions = options?.expirationTtl ? {
        ex: options.expirationTtl,
      } : undefined;
      await this.redis?.set(key, value, setOptions);
    }
  }

  async list(prefix?: string): Promise<string[]> {
    if (this.kv) {
      const list = await this.kv.list({ prefix });
      return list.keys.map(key => key.name);
    } else if (this.redis) {
      return await this.redis.keys(prefix || '*');
    }
    return [];
  }

  async delete(key: string): Promise<void> {
    if (this.kv) {
      await this.kv.delete(key);
    } else {
      await this.redis?.del(key);
    }
  }
}

let storage: AcStorage | null = null;
export default function createStorage(event: H3Event): AcStorage {
  if (!storage) {
    storage = new AcStorage(event);
  }
  return storage;
}
