import dotenv from "dotenv";
import { Environment, EnvSchema } from "../schemas";

dotenv.config();

export const env: Environment = EnvSchema.parse(process.env);
