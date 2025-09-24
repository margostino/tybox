import cors from "cors";
import express, { Application } from "express";
import { logger } from "./config";
import { env } from "./config/env";
import { initializeDatabase } from "./lib/database";
import { errorHandler, requestMetrics, responseHandler } from "./middlewares";
import routes from "./routes";

const app: Application = express();
const PORT = env.PORT;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestMetrics);
app.use(responseHandler);
app.use("/", routes);
app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
