import { Request, Response, Router } from "express";
import { getPrismaClient } from "../lib/database";

const router = Router();

router.get("/random", async (req: Request, res: Response) => {
  const prismaClient = getPrismaClient();
  const quotes = await prismaClient.quote.findMany({
    take: 10,
  });

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  res.json({
    success: true,
    data: randomQuote,
    timestamp: new Date().toISOString(),
  });
});

router.get("/", async (req: Request, res: Response) => {
  const prismaClient = getPrismaClient();
  const quotes = await prismaClient.quote.findMany();

  quotes.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));

  res.json({
    success: true,
    data: quotes,
    count: quotes.length,
    timestamp: new Date().toISOString(),
  });
});

router.get("/search", async (req: Request, res: Response) => {
  const prismaClient = getPrismaClient();
  const quotes = await prismaClient.quote.findMany();
  const query = req.query.q as string;
  const filteredQuotes = quotes.filter((q) => q.text.includes(query));
  res.json({
    success: true,
    data: filteredQuotes,
    count: filteredQuotes.length,
    timestamp: new Date().toISOString(),
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const prismaClient = getPrismaClient();
  const quote = await prismaClient.quote.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!quote) {
    return res.status(404).json({
      success: false,
      error: "Quote not found",
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    data: quote,
    timestamp: new Date().toISOString(),
  });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const prismaClient = getPrismaClient();
  const quote = await prismaClient.quote.delete({
    where: {
      id: req.params.id,
    },
  });

  if (!quote) {
    return res.status(404).json({
      success: false,
      error: "Quote not found",
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
  });
});

router.post("/", async (req: Request, res: Response) => {
  const prismaClient = getPrismaClient();
  const quote = await prismaClient.quote.create({
    data: req.body,
  });
  res.json({
    success: true,
    data: quote,
  });
});

export default router;
