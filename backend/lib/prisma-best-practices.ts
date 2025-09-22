/**
 * Prisma Connection Pool Best Practices
 */

import { PrismaClient } from "../generated/prisma";

// ❌ BAD: Creating multiple Prisma Client instances
function badExample() {
  const doSomething = async () => {
    const prisma = new PrismaClient(); // Creates new pool!
    const users = await prisma.user.findMany();
    await prisma.$disconnect(); // Destroys pool
    return users;
  };

  const doSomethingElse = async () => {
    const prisma = new PrismaClient(); // Another pool!
    const posts = await prisma.post.findMany();
    await prisma.$disconnect();
    return posts;
  };
}

// ✅ GOOD: Single shared instance (singleton pattern)
let prisma: PrismaClient;

function getClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export const goodExample = async () => {
  const client = getClient(); // Reuses pool
  const users = await client.user.findMany();
  const posts = await client.post.findMany();
  return { users, posts };
};

// ✅ GOOD: Proper transaction handling
export const transactionExample = async () => {
  const prisma = getClient();

  // Interactive transaction (uses single connection)
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: "test@example.com", name: "Test" },
    });

    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        bio: "Test bio",
      },
    });

    return { user, profile };
  });
};

// ✅ GOOD: Batch operations (efficient pool usage)
export const batchExample = async () => {
  const prisma = getClient();

  // Batches multiple operations in single query
  const users = await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1" },
      { email: "user2@example.com", name: "User 2" },
      { email: "user3@example.com", name: "User 3" },
    ],
  });

  return users;
};

// ✅ GOOD: Connection pool for serverless
export const serverlessConfig = () => {
  // For serverless environments (Vercel, Lambda)
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "&connection_limit=1",
      },
    },
  });
  return prisma;
};

// ✅ GOOD: Handling connection errors
export const errorHandling = async () => {
  const prisma = getClient();

  try {
    const result = await prisma.user.findMany({
      take: 10,
      // Add timeout to prevent hanging queries
      // This is handled at connection level
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("P2024")) {
        console.error("Connection pool timeout - too many requests");
        // Implement retry logic or return cached data
      } else if (error.message.includes("P2010")) {
        console.error("Connection failed");
        // Handle connection failure
      }
    }
    throw error;
  }
};

// ✅ GOOD: Graceful shutdown
export const gracefulShutdown = () => {
  const prisma = getClient();

  process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
  });
};

// Connection Pool Tips:
/*
1. Development vs Production:
   - Dev: connection_limit=5 (enough for testing)
   - Prod: connection_limit=10-20 (based on load)

2. Calculate optimal pool size:
   connections = (default_pool_size × app_instances) < max_connections

3. PostgreSQL max_connections:
   - Default: 100
   - Reserved for superuser: ~3
   - Available: ~97
   - Safe limit: 80

4. Monitor with:
   SELECT COUNT(*) FROM pg_stat_activity;
   SELECT max_connections FROM pg_settings;

5. For high concurrency:
   - Use PgBouncer in transaction mode
   - Set lower connection_limit in Prisma
   - Let PgBouncer handle pooling
*/
