"server-only";
import { logger } from "../logger";
import { Pool } from "pg";
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  idleTimeoutMillis: 30000,
});

// Ping the DB to check if the connection is healthy
pool
  .query("SELECT 1") // A lightweight query to check the connection
  .then(() => {
    logger.info(
      `Successfully connected to DB: ${process.env.DB_USERNAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`
    );
  })
  .catch((err) => {
    logger.error(
      `Failed to ping DB with user: : ${process.env.DB_USERNAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`,
      err
    );
  });

export default pool;
