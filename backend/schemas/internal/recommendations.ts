import { z } from "zod";
import { UuidSchema } from "./common";

export const MARKETS = [
  "SE",
  "GB",
  // and so on...
] as const;

export type Market = (typeof MARKETS)[number];

export const MarketSchema = z.preprocess((market) => {
  if (typeof market === "string") {
    return market.toUpperCase();
  }
  return market;
}, z.enum(MARKETS));

export const SPECIFIED_BINARY_GENDER = ["female", "male"] as const;

export const UserEmbeddingSchema = z.discriminatedUnion("version", [
  z.object({
    version: z.literal("v1"),
    market: MarketSchema,
    user_id: UuidSchema,
    gender: z
      .string()
      .transform((value) => value.toLowerCase())
      .pipe(z.enum(SPECIFIED_BINARY_GENDER))
      .optional(),
    vector: z.array(z.number()).superRefine((val, ctx) => {
      if (![128, 256].includes(val.length)) {
        ctx.addIssue({
          code: "custom",
          message: "Vector must be length 128 or 256",
        });
      }
    }),
  }),
  z.object({
    version: z.literal("v2"),
    market: MarketSchema,
    vector: z.array(z.number()).superRefine((val, ctx) => {
      if (![128, 256].includes(val.length)) {
        ctx.addIssue({
          code: "custom",
          message: "Vector must be length 128 or 256",
        });
      }
    }),
  }),
]);
