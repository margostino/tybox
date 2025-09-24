import { Redis } from "ioredis";
import RedisTimeout from "ioredis-timeout";
import { env, logger, redisStreamConfig } from "../config";

export const redisClient = new Redis(redisStreamConfig);

redisClient.on("connect", () => logger.info("🚀 Redis connected!"));
redisClient.on("error", (err: Error) => logger.error("❌ Redis error:", err));
redisClient.on("disconnect", () => logger.info("[Redis] Disconnected"));
redisClient.on("reconnecting", (delay: number) =>
  logger.info("[Redis] Reconnecting", { payload: { delay } })
);

RedisTimeout.timeout("set", env.REDIS_TIMEOUT, redisClient);
RedisTimeout.timeout("setex", env.REDIS_TIMEOUT, redisClient);
RedisTimeout.timeout("get", env.REDIS_TIMEOUT, redisClient);
RedisTimeout.timeout("mget", env.REDIS_TIMEOUT, redisClient);
RedisTimeout.timeout("ping", env.REDIS_TIMEOUT, redisClient);

// TODO: Add healthcheck and circuit breaker
