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
      // In development, create migrations if needed and apply them
      console.log("🔄 Checking database migrations...");
      execSync("npx prisma migrate dev --skip-seed", { stdio: "inherit" });
    }

    // Generate Prisma Client to ensure it's up to date
    console.log("🔧 Generating Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });

    console.log("✅ Database migrations applied successfully");
  } catch (error) {
    console.error("❌ Failed to apply migrations:", error);
    // In development, we might want to continue even if migrations fail
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
