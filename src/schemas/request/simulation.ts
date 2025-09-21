import { z } from "zod";

export const SimulationRequestSchema = z.object({
  project_id: z.string(),
  timeout_seconds: z.number().default(300),
});

export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;
