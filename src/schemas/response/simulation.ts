import { z } from "zod";

export const SimulationResponseSchema = z.object({
  id: z.string(),
});

export type SimulationResponse = z.infer<typeof SimulationResponseSchema>;
