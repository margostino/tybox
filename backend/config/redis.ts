import { env } from "./env";

export const redisConfig = {
  db: 0,
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  autoPipeliningIgnoredCommands: ["ping"],
  showFriendlyErrorStack: false,
  enableAutoPipelining: true,
  // enableOfflineQueue: false,
  maxRetriesPerRequest: 0,
  // tls: JSON.parse('true'),
};

export const redisStreamConfig = {
  ...redisConfig,
  stream: true,
};

// export const redisClient = new Redis(redisConfig);
// export const redisStreamClient = new Redis(redisConfig);
// // Separate client for blocking operations (no timeout)
// export const redisBlockingClient = new Redis(redisConfig);

// redisClient.on("connect", () => {
//   logger.info(`🚀 Redis connected to ${redisConfig.host}:${redisConfig.port} DB:${redisConfig.db}`);
// });

// redisStreamClient.on("connect", () => {
//   logger.info(
//     `🚀 Redis Stream Client connected to ${redisConfig.host}:${redisConfig.port} DB:${redisConfig.db}`
//   );
// });

// redisBlockingClient.on("connect", () => {
//   logger.info(
//     `🚀 Redis Blocking Client connected to ${redisConfig.host}:${redisConfig.port} DB:${redisConfig.db}`
//   );
// });
// redisClient.on("error", (err: Error) => logger.error("❌ Redis error:", err));
// redisClient.on("disconnect", () => logger.info("[Redis] Disconnected"));
// redisClient.on("reconnecting", (delay: number) =>
//   logger.info("[Redis] Reconnecting", { payload: { delay } })
// );

// redisStreamClient.on("error", (err: Error) => logger.error("❌ Redis Stream Client error:", err));
// redisStreamClient.on("disconnect", () => logger.info("[Redis Stream Client] Disconnected"));
// redisStreamClient.on("reconnecting", (delay: number) =>
//   logger.info("[Redis Stream Client] Reconnecting", { payload: { delay } })
// );

// redisBlockingClient.on("error", (err: Error) =>
//   logger.error("❌ Redis Blocking Client error:", err)
// );
// redisBlockingClient.on("disconnect", () => logger.info("[Redis Blocking Client] Disconnected"));
// redisBlockingClient.on("reconnecting", (delay: number) =>
//   logger.info("[Redis Blocking Client] Reconnecting", { payload: { delay } })
// );

// RedisTimeout.timeout("set", env.REDIS_TIMEOUT, redisClient);
// RedisTimeout.timeout("setex", env.REDIS_TIMEOUT, redisClient);
// RedisTimeout.timeout("get", env.REDIS_TIMEOUT, redisClient);
// RedisTimeout.timeout("mget", env.REDIS_TIMEOUT, redisClient);
// RedisTimeout.timeout("ping", env.REDIS_TIMEOUT, redisClient);

// // Add timeout for stream operations (except xread which uses BLOCK parameter)
// RedisTimeout.timeout("xadd", env.REDIS_TIMEOUT, redisStreamClient);
// RedisTimeout.timeout("xrange", env.REDIS_TIMEOUT, redisStreamClient);
// RedisTimeout.timeout("xlen", env.REDIS_TIMEOUT, redisStreamClient);
// // Note: xread timeout NOT applied as it uses BLOCK parameter for controlled timeouts

// // TODO: Add healthcheck and circuit breaker
