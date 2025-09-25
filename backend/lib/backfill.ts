import { quotesMock } from "../mocks";
import { usersMock } from "../mocks/users";
import { getPrismaClient } from "./database";

export async function backfill() {
  const prisma = getPrismaClient();

  const quotes = quotesMock;
  const users = usersMock;

  await Promise.all([
    prisma.quote.createMany({
      data: quotes,
      skipDuplicates: true,
    }),
    prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    }),
  ]);
}
