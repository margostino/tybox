import { z } from "zod";

export const GetQuotesRequestSchema = z.object({
  query: z.object().extend({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(500).default(4),
  }),
});

export type GetQuotesRequest = z.infer<typeof GetQuotesRequestSchema>;
