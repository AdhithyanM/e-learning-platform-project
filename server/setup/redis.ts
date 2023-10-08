import { Redis } from "ioredis";

const REDIS_URL: string = process.env.REDIS_URL || "";

const redisClient = () => {
  if (REDIS_URL) {
    const client = new Redis(REDIS_URL);
    console.log(`Connected to Redis`);
    return client;
  }
  throw new Error("Redis Connection failed");
};

export const redis = redisClient();
