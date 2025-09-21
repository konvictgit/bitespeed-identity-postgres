# Bitespeed Identity Reconciliation Service (Postgres)

# 🚀 Bitespeed Identity API

This project is built for the **Bitespeed Identity Reconciliation task**.  
It provides an API to reconcile user identities based on email and phone numbers.

---

## ✨ Features

- Exposes a single endpoint: `POST /identify`
- Accepts **JSON body** (not form-data)
- Reconciles contacts into **primary** and **secondary identities**
- Hosted online for testing and submission
- Uses **PostgreSQL (Neon.tech)** as the database
- Deployed on **Vercel**

---

## 🔗 Hosted URL

- **Root URL (Health Check)** → [https://bitespeed-identity-postgres.vercel.app](https://bitespeed-identity-postgres.vercel.app)  
  Shows project name and usage instructions.  

- **Identify Endpoint** →  
  `POST https://bitespeed-identity-postgres.vercel.app/identify`

---

## ⚙️ Tech Stack

- **Node.js** + **Express**
- **PostgreSQL** (Neon)
- **TypeScript**
- **Vercel** (serverless deployment)

---

## 📦 Setup (Local Development)

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/bitespeed-identity-postgres.git
   cd bitespeed-identity-postgres


## 🛠️ API Usage
Endpoint

POST /identify

Request Body

Must include at least one of email or phoneNumber.

{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}

Response Example
{
  "contact": {
    "primaryContactId": 1,
    "emails": [
      "lorraine@hillvalley.edu",
      "mcfly@hillvalley.edu"
    ],
    "phoneNumbers": [
      "123456"
    ],
    "secondaryContactIds": [2]
  }
}


## 🧪 Testing with Postman / Curl

Curl Example

curl -X POST https://bitespeed-identity-postgres.vercel.app/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}'


Postman Example

Method: POST

URL: https://bitespeed-identity-postgres.vercel.app/identify

Body → raw JSON:

{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}

