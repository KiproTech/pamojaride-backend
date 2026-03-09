// src/db.js
import mariadb from 'mariadb';

export const pool = mariadb.createPool({
  host: 'localhost',        // your DB host
  user: 'root',    // your DB username
  password: 'Kiprotich1069', // your DB password
  database: 'pamojaride', // your DB name
  connectionLimit: 5,
});
