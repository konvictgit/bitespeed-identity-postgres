const fs = require("fs");
const { Pool } = require("pg");

(async () => {
  try {
    require("dotenv").config();
    const sql = fs.readFileSync("./migrations/create_contact.sql", "utf8");

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
      console.log("Migration executed.");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
    await pool.end();
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
})();
