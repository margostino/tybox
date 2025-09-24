import { z } from "zod";

export const UuidSchema = z.string().length(36, { message: "Must be a uuid v4" });
