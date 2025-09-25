import { getRedisClient } from "../clients";

export const initializeStream = async () => {
  const redisClient = getRedisClient();
  try {
    const streamLength = await redisClient.xlen("feed");
    console.log(`📨 Feed stream has ${streamLength} messages`);

    // If stream doesn't exist, create it with an initial message
    if (streamLength === 0) {
      await redisClient.xadd(
        "feed",
        "*",
        "type",
        "system",
        "data",
        JSON.stringify({ message: "Stream initialized", timestamp: new Date().toISOString() })
      );
      console.log("Feed stream initialized");
    }
  } catch (error) {
    console.error("Error initializing stream:", error);
    try {
      await redisClient.xadd(
        "feed",
        "*",
        "type",
        "system",
        "data",
        JSON.stringify({ message: "Stream created", timestamp: new Date().toISOString() })
      );
      console.log("Feed stream created");
    } catch (createError) {
      console.error("Failed to create stream:", createError);
    }
  }
};
