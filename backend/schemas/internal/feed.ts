import { z } from "zod";
import { NonEmptyStringSchema } from "./common";
import { IsoDateStringSchema } from "./date";
import { QuoteSchema } from "./quote";

export const FEED_TYPES = {
  RANDOM_QUOTE: "random_quote",
  CREATED_QUOTE: "created_quote",
  DELETED_QUOTE: "deleted_quote",
  UPDATED_QUOTE: "updated_quote",
} as const;

export const FeedTypeSchema = z.enum([
  FEED_TYPES.RANDOM_QUOTE,
  FEED_TYPES.CREATED_QUOTE,
  FEED_TYPES.DELETED_QUOTE,
  FEED_TYPES.UPDATED_QUOTE,
]);

export type FeedType = z.infer<typeof FeedTypeSchema>;

export const FeedEventMetadataSchema = z.object({
  timestamp: IsoDateStringSchema,
  username: z.string().min(1),
});

export const RandomQuoteFeedEventDataSchema = z.object({
  quote: QuoteSchema,
});

export const CreatedQuoteFeedEventDataSchema = z.object({
  before: z.literal(null),
  after: NonEmptyStringSchema,
});

// Updated or Deleted
export const ModifiedQuoteFeedEventDataSchema = z.object({
  before: NonEmptyStringSchema,
  after: NonEmptyStringSchema,
});

export const FeedEventSchema = z.object({
  metadata: FeedEventMetadataSchema,
  type: FeedTypeSchema,
  data: z.union([
    RandomQuoteFeedEventDataSchema,
    CreatedQuoteFeedEventDataSchema,
    ModifiedQuoteFeedEventDataSchema,
  ]),
});

export type FeedEvent = z.infer<typeof FeedEventSchema>;
export type RandomQuoteFeedEventData = z.infer<typeof RandomQuoteFeedEventDataSchema>;
export type CreatedQuoteFeedEventData = z.infer<typeof CreatedQuoteFeedEventDataSchema>;
export type ModifieduoteFeedEventData = z.infer<typeof ModifiedQuoteFeedEventDataSchema>;
