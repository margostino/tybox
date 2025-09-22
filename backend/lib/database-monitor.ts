import { getPrismaClient } from "./database";

/**
 * Monitor Prisma connection pool metrics
 */
export async function monitorConnectionPool() {
  const prisma = getPrismaClient();

  // Get pool metrics (Prisma doesn't expose these directly,
  // but you can query PostgreSQL for connection info)
  const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count
    FROM pg_stat_activity
    WHERE datname = ${process.env.DATABASE_NAME || "tybox"}
      AND application_name LIKE 'Prisma Client%'
  `;

  const activeConnections = Number(result[0]?.count || 0);

  // Get all connections info
  const connections = await prisma.$queryRaw<
    Array<{
      pid: number;
      usename: string;
      application_name: string;
      client_addr: string;
      state: string;
      query_start: Date;
      state_change: Date;
    }>
  >`
    SELECT
      pid,
      usename,
      application_name,
      client_addr,
      state,
      query_start,
      state_change
    FROM pg_stat_activity
    WHERE datname = ${process.env.DATABASE_NAME || "tybox"}
    ORDER BY query_start DESC
  `;

  return {
    activeConnections,
    connectionDetails: connections,
    timestamp: new Date(),
  };
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const prisma = getPrismaClient();

  const stats = await prisma.$queryRaw<
    Array<{
      database: string;
      connections: bigint;
      xact_commit: bigint;
      xact_rollback: bigint;
      blks_read: bigint;
      blks_hit: bigint;
      tup_returned: bigint;
      tup_fetched: bigint;
      tup_inserted: bigint;
      tup_updated: bigint;
      tup_deleted: bigint;
    }>
  >`
    SELECT
      datname as database,
      numbackends as connections,
      xact_commit,
      xact_rollback,
      blks_read,
      blks_hit,
      tup_returned,
      tup_fetched,
      tup_inserted,
      tup_updated,
      tup_deleted
    FROM pg_stat_database
    WHERE datname = ${process.env.DATABASE_NAME || "tybox"}
  `;

  return stats[0];
}

/**
 * Test connection pool behavior
 */
export async function testConnectionPool() {
  const prisma = getPrismaClient();

  console.log("🧪 Testing connection pool...\n");

  // Monitor before load
  const before = await monitorConnectionPool();
  console.log(`📊 Connections before: ${before.activeConnections}`);

  // Create concurrent queries to test pooling
  const promises = Array.from({ length: 20 }, async (_, i) => {
    const start = Date.now();
    await prisma.user.findMany({ take: 1 });
    const duration = Date.now() - start;
    return { query: i + 1, duration };
  });

  // Execute all queries concurrently
  console.log("\n🔄 Executing 20 concurrent queries...");
  const results = await Promise.all(promises);

  // Monitor during load
  const during = await monitorConnectionPool();
  console.log(`📊 Connections during load: ${during.activeConnections}`);

  // Show query performance
  console.log("\n⚡ Query execution times:");
  results.forEach((r) => {
    console.log(`  Query ${r.query}: ${r.duration}ms`);
  });

  const avgTime = results.reduce((acc, r) => acc + r.duration, 0) / results.length;
  console.log(`\n📈 Average query time: ${avgTime.toFixed(2)}ms`);

  // Wait a bit and check again
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const after = await monitorConnectionPool();
  console.log(`\n📊 Connections after cooldown: ${after.activeConnections}`);

  // Get database stats
  const stats = await getDatabaseStats();
  console.log("\n📊 Database Statistics:");
  console.log(`  Total connections: ${stats?.connections}`);
  console.log(`  Transactions committed: ${stats?.xact_commit}`);
  console.log(`  Transactions rolled back: ${stats?.xact_rollback}`);
  console.log(
    `  Cache hit ratio: ${
      stats?.blks_hit && stats?.blks_read
        ? (
            (Number(stats.blks_hit) / (Number(stats.blks_hit) + Number(stats.blks_read))) *
            100
          ).toFixed(2)
        : "N/A"
    }%`
  );
}
