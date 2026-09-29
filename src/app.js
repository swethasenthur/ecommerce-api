import "dotenv/config";

import express from "express";
import prisma from "./config/prisma.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import fs from "node:fs";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";

const openapiDocument = YAML.parse(
  fs.readFileSync("./docs/openapi.yaml", "utf8")
);

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Ecommerce API is running"
  });
});
app.get("/health/database", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 AS result`;

    res.status(200).json({
      status: "ok",
      database: "connected"
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      status: "error",
      database: "unavailable"
    });
  }
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use(errorHandler);
export default app;
