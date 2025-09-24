import { z } from "zod";

export const QuoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Quote = z.infer<typeof QuoteSchema>;
