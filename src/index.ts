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

app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Bitespeed-Identity API</h1>
    <p>This is the backend service for the Bitespeed Identity Reconciliation task.</p>
    <p>Use <code>POST /identify</code> with a JSON body like:</p>
    <pre>
    {
      "email": "lorraine@hillvalley.edu",
      "phoneNumber": "123456"
    }
    </pre>
    <p>to see identity resolution in action.</p>
  `);
});

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

    // ✅ use lowercase table/column names
    const initialRows = await client.query(
      `SELECT * FROM contact 
       WHERE (email = $1 AND email IS NOT NULL) 
       OR (phonenumber = $2 AND phonenumber IS NOT NULL)`,
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
        `SELECT * FROM contact 
         WHERE (email = ANY($1::text[])) 
         OR (phonenumber = ANY($2::text[]))`,
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

    if (ids.length === 0) {
      // No contact found → insert new primary
      const insert = await client.query(
        `INSERT INTO contact (phonenumber,email,linkedid,linkprecedence,createdat,updatedat,deletedat)
         VALUES ($1,$2,NULL,'primary',$3,$3,NULL) RETURNING *`,
        [incomingPhone, incomingEmail, nowIso()]
      );
      const c = insert.rows[0];
      await client.query("COMMIT");
      return res.json({
        contact: {
          primaryContactId: c.id,
          emails: c.email ? [c.email] : [],
          phoneNumbers: c.phonenumber ? [c.phonenumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // ✅ if contacts exist → compute response instead of hanging
    const contacts = await client.query(
      `SELECT * FROM contact WHERE id = ANY($1::int[])`,
      [ids]
    );

    // find primary
    let primary = contacts.rows.find(
      (c: any) => c.linkprecedence === "primary"
    );
    if (!primary) {
      primary = contacts.rows.reduce((prev: any, curr: any) =>
        prev.id < curr.id ? prev : curr
      );
    }

    const secondaryIds = contacts.rows
      .filter((c: any) => c.id !== primary.id)
      .map((c: any) => c.id);

    await client.query("COMMIT");

    return res.json({
      contact: {
        primaryContactId: primary.id,
        emails: [...emails],
        phoneNumbers: [...phones],
        secondaryContactIds: secondaryIds,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  } finally {
    client.release();
  }
});

export default app;
