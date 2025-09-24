import { Request, Response, Router } from "express";

const router = Router();

const quotes = [
  { id: 1, text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  {
    id: 2,
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
  },
  {
    id: 3,
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
  },
  {
    id: 4,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    id: 5,
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    id: 6,
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  { id: 7, text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  {
    id: 8,
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  { id: 9, text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  {
    id: 10,
    text: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
  },
  {
    id: 11,
    text: "The only impossible thing is that which you don't attempt.",
    author: "Gabriel García Márquez",
  },
  {
    id: 12,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  { id: 13, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  {
    id: 14,
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
  },
  {
    id: 15,
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    id: 16,
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
  },
  {
    id: 17,
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
  },
  { id: 18, text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  {
    id: 19,
    text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar",
  },
  {
    id: 20,
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
  },
];

router.get("/random", (req: Request, res: Response) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  res.json({
    success: true,
    data: quote,
    timestamp: new Date().toISOString(),
  });
});

router.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: quotes,
    count: quotes.length,
    timestamp: new Date().toISOString(),
  });
});

router.get("/search", (req: Request, res: Response) => {
  const query = req.query.q as string;
  res.json({
    success: true,
    data: quotes.filter((q) => q.text.includes(query)),
  });
});

router.get("/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const quote = quotes.find((q) => q.id === id);

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

export default router;
