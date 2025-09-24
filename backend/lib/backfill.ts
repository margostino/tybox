import { quotesMock } from "../mocks";
import { getPrismaClient } from "./database";

export async function backfill() {
  const quotes = quotesMock;
  const prisma = getPrismaClient();
  await prisma.quote.createMany({
    data: quotes,
    skipDuplicates: true,
  });
}
