# MiniMail Deployment

This app deploys as two services:

- Backend: Node/Express API
- Frontend: Vite static site

## Backend Environment

Set these variables on the backend host:

```txt
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
EMAIL_DOMAIN=reykraft.indevs.in
ADMIN_EMAILS=admin1@reykraft.indevs.in
FRONTEND_URL=https://your-frontend-domain.com
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...
COOKIE_SECURE=true
```

Use the exact frontend origin for `FRONTEND_URL`, without a trailing slash.

## Frontend Environment

Set this variable on the frontend host:

```txt
VITE_API_URL=https://your-backend-domain.com/api
```

## Suggested Hosts

### Backend on Render or Railway

Use:

```txt
Root directory: backend
Build command: npm install
Start command: npm start
```

After deployment, confirm:

```txt
https://your-backend-domain.com/health
```

returns JSON with `status: "ok"`.

### Frontend on Vercel or Netlify

Use:

```txt
Root directory: frontend
Build command: npm run build
Publish/output directory: dist
```

## Resend Webhook

After the backend is deployed, update the Resend webhook endpoint to:

```txt
https://your-backend-domain.com/api/webhook/inbound
```

Select the `email.received` event and copy the webhook signing secret into `RESEND_WEBHOOK_SECRET`.

## Production Smoke Test

After both services are deployed:

1. Register or log in with the primary email ID.
2. Open Settings > Registered email IDs.
3. Create an ID with Add ID.
4. Log out, then log in using the generated ID and the same password.
5. Send an email from the selected ID.
6. Send an external email to that ID.
7. Confirm it appears after webhook delivery or Sync.
8. Switch Inbox IDs and confirm each inbox filters correctly.
