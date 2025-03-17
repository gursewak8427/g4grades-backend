import Redis from "ioredis";

// Define a single Redis instance
let redisInstance: Redis | null = null;

/**
 * Function to connect to Redis (Singleton)
 */
const connectRedis = (): Redis => {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL?.toString() || "", {
      tls: {
        rejectUnauthorized: false, // Required for secure Redis connections
      },
      keepAlive: 10000, // Keep connection alive for 10 seconds
      retryStrategy: (times: number) => {
        if (times > 5) {
          console.error("❌ Maximum Redis reconnect attempts reached.");
          return null; // Stop retrying after 5 attempts
        }
        const delay = Math.min(times * 1000, 5000); // Exponential backoff (max 5s)
        console.warn(`⚠️ Redis reconnect attempt ${times} in ${delay}ms...`);
        return delay;
      },
    });

    redisInstance.on("connect", () => {
      console.log("✅ Connected to Redis");
    });

    redisInstance.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });

    redisInstance.on("end", () => {
      console.warn("⚠️ Redis connection closed. Attempting to reconnect...");
    });

    redisInstance.on("reconnecting", (time: string) => {
      console.warn(`🔄 Redis is reconnecting... Attempt in ${time}ms`);
    });
  }

  return redisInstance; // Return the existing instance if already created
};

export default connectRedis;
