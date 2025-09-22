import { execSync } from "child_process";
import { PrismaClient } from "../generated/prisma";

let prisma: PrismaClient;

export async function initializeDatabase(): Promise<PrismaClient> {
  if (prisma) {
    return prisma;
  }

  // Check if we're in production or development
  const isProduction = process.env.NODE_ENV === "production";

  try {
    if (isProduction) {
      // In production, run migration deploy (applies pending migrations)
      console.log("📦 Applying database migrations...");
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
    } else {
      // In development, skip automatic migration and generation
      // Let the developer run migrations manually when needed
      console.log("🔄 Skipping automatic migrations in development mode");
      console.log("💡 Run 'yarn prisma:migrate' to apply migrations manually");
    }

    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Failed to apply migrations:", error);
    // In production, we should probably exit
    if (isProduction) {
      process.exit(1);
    }
  }

  // Initialize Prisma Client
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  });

  // Test the connection
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw error;
  }

  // Gracefully shutdown
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });

  return prisma;
}

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return prisma;
}
