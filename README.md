# MiniMail

A production-ready mini Gmail-style email application using React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, and Resend.

## What It Does

- Registers and logs in users with JWT auth in an httpOnly cookie.
- Creates domain mailboxes such as `user@mydomain.com`.
- Sends mail through Resend and stores sent messages in MongoDB.
- Receives mail through `POST /api/webhook/inbound`.
- Routes any `*@mydomain.com` inbound address to a matching registered user.
- Stores inbox and sent mail in MongoDB without IMAP, POP3, or external mailbox providers.
- Includes inbox, sent, compose, search, pagination, message detail, and reply flow.

## Project Structure

```txt
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  server.js
frontend/
  src/
    components/
    context/
    pages/
    services/
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend environment:

```bash
cp backend/.env.example backend/.env
```

Set:

- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_DOMAIN`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `FRONTEND_URL`

3. Configure frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

4. Start MongoDB locally or point `MONGODB_URI` at MongoDB Atlas.

5. Run the backend:

```bash
npm run dev:backend
```

6. Run the frontend:

```bash
npm run dev:frontend
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Resend Setup

1. Verify your sending domain in Resend.
2. Configure inbound receiving for the same domain.
3. Add a webhook in the Resend dashboard:

```txt
https://your-public-api-url.com/api/webhook/inbound
```

4. Select the `email.received` event.
5. Copy the webhook signing secret into `RESEND_WEBHOOK_SECRET`.

For local webhook testing, expose the backend with ngrok or a similar tunnel:

```bash
ngrok http 5000
```

Use the public HTTPS URL plus `/api/webhook/inbound` in Resend.

## API

### Auth

`POST /api/auth/register`

Request:

```json
{
  "email": "alex@mydomain.com",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": "665f3b6f7aa2c6c7e932e311",
    "email": "alex@mydomain.com",
    "createdAt": "2026-04-30T09:30:00.000Z"
  }
}
```

`POST /api/auth/login`

Request:

```json
{
  "email": "alex@mydomain.com",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": "665f3b6f7aa2c6c7e932e311",
    "email": "alex@mydomain.com",
    "createdAt": "2026-04-30T09:30:00.000Z"
  }
}
```

### Email

`POST /api/email/send`

Request:

```json
{
  "to": "friend@example.com",
  "subject": "Hello",
  "body": "<p>Hi from MiniMail.</p>"
}
```

Response:

```json
{
  "email": {
    "_id": "665f3d59c27d19ee1d8b4c01",
    "from": "alex@mydomain.com",
    "to": "friend@example.com",
    "subject": "Hello",
    "body": "<p>Hi from MiniMail.</p>",
    "type": "sent",
    "messageId": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794",
    "createdAt": "2026-04-30T09:35:00.000Z"
  },
  "delivery": {
    "id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
  }
}
```

`GET /api/email/inbox?page=1&limit=20&q=hello`

Response:

```json
{
  "emails": [
    {
      "_id": "665f3d94c27d19ee1d8b4c08",
      "from": "sender@example.com",
      "to": "alex@mydomain.com",
      "subject": "Hello",
      "body": "<p>Inbound content</p>",
      "type": "inbox",
      "messageId": "<provider-message-id>",
      "createdAt": "2026-04-30T09:40:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

`GET /api/email/sent?page=1&limit=20`

Response shape matches inbox.

`GET /api/email/:id`

Response:

```json
{
  "email": {
    "_id": "665f3d94c27d19ee1d8b4c08",
    "from": "sender@example.com",
    "to": "alex@mydomain.com",
    "subject": "Hello",
    "body": "<p>Inbound content</p>",
    "type": "inbox",
    "messageId": "<provider-message-id>",
    "createdAt": "2026-04-30T09:40:00.000Z"
  }
}
```

### Webhook

`POST /api/webhook/inbound`

Resend sends:

```json
{
  "type": "email.received",
  "created_at": "2026-04-30T09:40:00.000Z",
  "data": {
    "email_id": "56761188-7520-42d8-8898-ff6fc54ce618",
    "from": "Sender <sender@example.com>",
    "to": ["alex@mydomain.com"],
    "message_id": "<provider-message-id>",
    "subject": "Hello"
  }
}
```

Response:

```json
{
  "received": true,
  "stored": 1,
  "ids": ["665f3d94c27d19ee1d8b4c08"]
}
```

## Deployment Notes

- Backend can deploy to Render, Railway, Fly.io, or any Node host.
- Frontend can deploy to Vercel, Netlify, or static hosting after `npm run build:frontend`.
- Set `COOKIE_SECURE=true` and `NODE_ENV=production` in production.
- Use the deployed frontend URL for `FRONTEND_URL`.
- Use a managed MongoDB connection string for `MONGODB_URI`.
