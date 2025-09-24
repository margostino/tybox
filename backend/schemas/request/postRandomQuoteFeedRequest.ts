import { z } from "zod";
import { QuoteSchema } from "../response";

export const PostRandomQuoteFeedRequestSchema = z.object({
  quote: QuoteSchema,
});

export type PostRandomQuoteFeedRequest = z.infer<typeof PostRandomQuoteFeedRequestSchema>;
