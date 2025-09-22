import { Queue } from "bullmq";
import { redisConfig } from "./redis";

const queueConfig = {
  connection: redisConfig,
  concurrency: 1,
  autorun: true,
};

const simulationsQueue = new Queue(`simulations`, {
  connection: redisConfig,
});

export { queueConfig, simulationsQueue };
