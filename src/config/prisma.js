import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client.ts";

const sqlConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME || "ecommerce",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false"
  }
};

const adapter = new PrismaMssql(sqlConfig);
const prisma = new PrismaClient({ adapter });

export default prisma;