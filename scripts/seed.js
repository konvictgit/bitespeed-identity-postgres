// scripts/seed.js
const fs = require("fs");
const { Pool } = require("pg");
require("dotenv").config();

(async () => {
  try {
    const sql = fs.readFileSync("./migrations/seed.sql", "utf8");

    const pool = new Pool({
      host: process.env.PGHOST || "localhost",
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || "bitespeed",
    });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log("Seed executed.");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
    await pool.end();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
})();
