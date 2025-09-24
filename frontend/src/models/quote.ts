import { z } from "zod";

export const QuoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  createdAt: z.string().default(new Date().toISOString()),
  updatedAt: z.string().default(new Date().toISOString()),
});

export type Quote = z.infer<typeof QuoteSchema>;
