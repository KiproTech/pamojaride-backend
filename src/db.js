import mariadb from "mariadb";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const pool = mariadb.createPool({
  host: isProduction ? process.env.DB_HOST : "localhost",
  user: isProduction ? process.env.DB_USER : "root",
  password: isProduction ? process.env.DB_PASSWORD : "Kiprotich1069",
  database: isProduction ? process.env.DB_NAME : "pamojaride",
  port: isProduction ? Number(process.env.DB_PORT) : 3306,
  connectionLimit: 5,
  ...(isProduction && {
    ssl: { rejectUnauthorized: false }
  })
});