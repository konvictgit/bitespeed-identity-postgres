# Bitespeed Identity Reconciliation Service (Postgres)

## Overview
Node.js + TypeScript Express service exposing **POST /identify** to consolidate contacts into primary + secondary identities using PostgreSQL.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Build
```bash
npm run build
```

### 3. Setup Postgres DB
Create a database, e.g. `bitespeed`.

Run migration:
```sql
CREATE TABLE IF NOT EXISTS Contact (
  id SERIAL PRIMARY KEY,
  phoneNumber TEXT,
  email TEXT,
  linkedId INT REFERENCES Contact(id),
  linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary','secondary')) NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL,
  updatedAt TIMESTAMPTZ NOT NULL,
  deletedAt TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_email ON Contact(email);
CREATE INDEX IF NOT EXISTS idx_contact_phone ON Contact(phoneNumber);
CREATE INDEX IF NOT EXISTS idx_contact_linkedId ON Contact(linkedId);
```

### 4. Configure environment variables
Create `.env` file:
```
PGHOST=localhost
PGPORT=5432
PGUSER=youruser
PGPASSWORD=yourpassword
PGDATABASE=bitespeed
```

### 5. Start the service
```bash
npm start
```

Server will run on port 3000.

### 6. Example
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}'
```