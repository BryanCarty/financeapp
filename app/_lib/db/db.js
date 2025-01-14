"server-only";

import { Pool } from "pg";
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  idleTimeoutMillis: 30000,
});

export default pool;
