import express from "express";
import bodyParser from "body-parser";
import { pool } from "./db";
import "dotenv/config";

const app = express();
app.use(bodyParser.json());

function nowIso() {
  return new Date().toISOString();
}

function normalizePhone(p: any): string | null {
  if (p === undefined || p === null) return null;
  return String(p);
}

app.post("/identify", async (req, res) => {
  const incomingEmail = req.body.email ?? null;
  const incomingPhone = normalizePhone(req.body.phoneNumber ?? null);

  if (!incomingEmail && !incomingPhone) {
    return res
      .status(400)
      .json({ error: "At least one of email or phoneNumber must be provided" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Step 1: find existing contacts with same email or phone
    const initialRows = await client.query(
      `SELECT * FROM Contact WHERE (email = $1 AND email IS NOT NULL) OR (phoneNumber = $2 AND phoneNumber IS NOT NULL)`,
      [incomingEmail, incomingPhone]
    );

    let ids: number[] = [];
    let emails = new Set<string>();
    let phones = new Set<string>();

    initialRows.rows.forEach((r: any) => {
      if (r.email) emails.add(r.email);
      if (r.phonenumber) phones.add(r.phonenumber);
      ids.push(r.id);
    });

    // Expand connected set
    let changed = true;
    while (changed) {
      changed = false;
      const rows = await client.query(
        `SELECT * FROM Contact WHERE 
          (email = ANY($1::text[])) OR 
          (phoneNumber = ANY($2::text[]))`,
        [[...emails], [...phones]]
      );
      for (const r of rows.rows) {
        if (!ids.includes(r.id)) {
          ids.push(r.id);
          if (r.email) emails.add(r.email);
          if (r.phonenumber) phones.add(r.phonenumber);
          changed = true;
        }
      }
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  } finally {
    client.release();
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log("Server listening on port", port);
});
