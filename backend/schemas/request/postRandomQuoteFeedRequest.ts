import { z } from "zod";
import { QuoteResponseSchema } from "../response";

export const PostRandomQuoteFeedRequestSchema = z.object({
  quote: QuoteResponseSchema,
});

export type PostRandomQuoteFeedRequest = z.infer<typeof PostRandomQuoteFeedRequestSchema>;
