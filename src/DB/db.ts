import mariadb from "mariadb";
import "dotenv/config";
import { env } from "../env";

export const pool = mariadb.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONN_LIMIT
});