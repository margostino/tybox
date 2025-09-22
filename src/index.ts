import express, { Application } from "express";
import { logger } from "./config";
import { env } from "./config/env";
import { initializeDatabase } from "./lib/database";
import { errorHandler, requestMetrics, responseHandler } from "./middlewares";
import routes from "./routes";

const app: Application = express();
const PORT = env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestMetrics);
app.use(responseHandler);
// app.use(
//   cors({
//     origin: [process.env.FRONTEND_URL || "http://localhost:7000", "http://localhost:8888"],
//     methods: ["GET", "POST"],
//   })
// );
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
