import { PrismaClient } from "../generated/prisma";

/**
 * Demo: What happens when exceeding connection limits
 */

// Scenario 1: Exceeding Prisma pool limit
export async function exceedPoolLimit() {
  // Create client with small pool
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "&connection_limit=3&pool_timeout=2",
      },
    },
  });

  console.log("🧪 Testing with connection_limit=3, pool_timeout=2s\n");

  try {
    // Try to run 10 concurrent long-running queries
    const queries = Array.from({ length: 10 }, async (_, i) => {
      console.log(`Query ${i + 1}: Starting...`);
      const start = Date.now();

      try {
        // Simulate slow query with pg_sleep
        await prisma.$queryRaw`SELECT pg_sleep(5)`;

        const duration = Date.now() - start;
        console.log(`✅ Query ${i + 1}: Success after ${duration}ms`);
        return { query: i + 1, status: "success", duration };
      } catch (error) {
        const duration = Date.now() - start;
        console.log(`❌ Query ${i + 1}: Failed after ${duration}ms`);

        if (error instanceof Error) {
          if (error.message.includes("P2024")) {
            console.log(`   → Connection pool timeout!`);
          }
        }
        return { query: i + 1, status: "failed", duration, error };
      }
    });

    const results = await Promise.all(queries);

    // Summary
    console.log("\n📊 Results Summary:");
    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    console.log(`  Succeeded: ${succeeded}/10`);
    console.log(`  Failed: ${failed}/10`);
    console.log(`  Reason: Pool limit (3) + timeout (2s)`);
  } finally {
    await prisma.$disconnect();
  }
}

// Scenario 2: Handle connection pool timeout gracefully
export async function handlePoolTimeout() {
  const prisma = new PrismaClient();

  async function queryWithRetry(id: number, retries = 3): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await prisma.user.findMany({ take: 1 });
        console.log(`✅ Query ${id}: Success on attempt ${attempt}`);
        return result;
      } catch (error) {
        if (error instanceof Error && error.message.includes("P2024")) {
          console.log(`⚠️ Query ${id}: Pool timeout on attempt ${attempt}`);

          if (attempt < retries) {
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`   → Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            console.log(`❌ Query ${id}: Failed after ${retries} attempts`);
            throw error;
          }
        } else {
          throw error;
        }
      }
    }
  }

  // Run queries with retry logic
  const queries = Array.from({ length: 5 }, (_, i) => queryWithRetry(i + 1));
  await Promise.all(queries);
}

// Scenario 3: Monitor and prevent limit issues
export async function preventLimitIssues() {
  const prisma = new PrismaClient();

  // Check current connections before heavy operation
  const currentConnections = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM pg_stat_activity
    WHERE datname = current_database()
  `;

  const maxConnections = await prisma.$queryRaw<[{ setting: string }]>`
    SELECT setting FROM pg_settings WHERE name = 'max_connections'
  `;

  const used = Number(currentConnections[0].count);
  const max = Number(maxConnections[0].setting);
  const available = max - used;

  console.log("📊 Connection Status:");
  console.log(`  Used: ${used}/${max}`);
  console.log(`  Available: ${available}`);
  console.log(`  Usage: ${((used / max) * 100).toFixed(1)}%`);

  // Decide based on available connections
  if (available < 10) {
    console.log("⚠️ WARNING: Low on connections!");
    console.log("  → Implementing throttling...");

    // Process in smaller batches
    const items = Array.from({ length: 100 }, (_, i) => i);
    const batchSize = 5; // Small batch to avoid exhausting connections

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map((item) => prisma.user.findMany({ take: 1 })));
      console.log(`  Processed batch ${Math.floor(i / batchSize) + 1}`);
    }
  } else {
    console.log("✅ Plenty of connections available");
    // Process normally
  }

  await prisma.$disconnect();
}

// What to do when limits are exceeded:
export const recoveryStrategies = {
  // 1. Immediate Actions
  immediate: {
    reducePoolSize: "Lower connection_limit in DATABASE_URL",
    implementRetries: "Add exponential backoff for P2024 errors",
    addCircuitBreaker: "Stop attempting connections when failing",
  },

  // 2. Short-term Fixes
  shortTerm: {
    increaseTimeout: "Increase pool_timeout to wait longer",
    batchOperations: "Group multiple operations into transactions",
    cacheResults: "Cache frequent queries to reduce DB load",
  },

  // 3. Long-term Solutions
  longTerm: {
    addPgBouncer: "Add connection pooler between app and DB",
    scaleDatabase: "Increase PostgreSQL max_connections",
    optimizeQueries: "Find and fix slow queries causing bottlenecks",
    addReadReplicas: "Distribute read queries to replicas",
  },

  // 4. Monitoring
  monitoring: {
    trackMetrics: "Monitor active connections continuously",
    setAlerts: "Alert when connections > 80% of limit",
    logErrors: "Track P2024 errors to identify patterns",
  },
};
