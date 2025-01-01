// db.js

import postgres from "postgres";

/*
const sql = postgres(
  `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
);
*/

const sql = postgres({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  max: 20, // maximum number of concurrent connections in the pool
  min: 2, // minimum number of connections in the pool
  idleTimeout: 30000, // close idle connections after 30 seconds
  connectionTimeout: 2000, // wait 2 seconds for a connection before throwing an error
  // other options can be added here as needed
});
export default sql;
