import { execSync } from "child_process";
import { PrismaClient } from "../generated/prisma";
import { backfill } from "./backfill";

let prisma: PrismaClient;

export async function initializeDatabase(): Promise<PrismaClient> {
  if (prisma) {
    return prisma;
  }

  const isProduction = process.env.NODE_ENV === "production";

  try {
    if (isProduction) {
      console.log("📦 Applying database migrations...");
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
    } else {
      console.log("🔄 Skipping automatic migrations in development mode");
      console.log("💡 Run 'yarn prisma:migrate' to apply migrations manually");
    }

    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Failed to apply migrations:", error);
    if (isProduction) {
      process.exit(1);
    }
  }

  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  });

  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
    await backfill();
    console.log("✅ Database backfilled");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw error;
  }

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
