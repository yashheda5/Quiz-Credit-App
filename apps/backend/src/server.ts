
import "dotenv/config";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infrastructure/database/prisma.js";
import { connectRedis, redis } from "./infrastructure/cache/redis.js";

async function startServer() {
  try {
    // Connect to PostgreSQL
    await prisma.$connect();
    console.log("PostgreSQL connected");

    // Connect to Redis
    await connectRedis();
    console.log("Redis connected");

    // Start Express server
    const server = app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${env.PORT}`);
    });

    // Graceful shutdown
    async function shutdown(signal: string) {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        try {
          if (redis.isOpen) {
            await redis.quit();
          }

          await prisma.$disconnect();
          console.log("Connections closed successfully");

          process.exit(0);
        } catch (error) {
          console.error("Shutdown error:", error);
          process.exit(1);
        }
      });
    }

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  } catch (error) {
    console.error("Server startup failed:", error);

    if (redis.isOpen) {
      await redis.quit().catch(() => {});
    }

    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

void startServer();
