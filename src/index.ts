import express, { Application } from "express";
import { logger } from "./config";
import { env } from "./config/env";
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

app.listen(PORT, async () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

export default app;
