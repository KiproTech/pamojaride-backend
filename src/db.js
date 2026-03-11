import mariadb from "mariadb";
import dotenv from "dotenv";
dotenv.config();

export const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  connectionLimit: 5,
  ssl: { rejectUnauthorized: false }, // allow Railway self-signed SSL
  connectTimeout: 20000,             // increase timeout
  waitForConnections: true,
  queueLimit: 0
});