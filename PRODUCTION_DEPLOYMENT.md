# Stay Wise Production Deployment Checklist

This project is ready to build, but do not deploy a build that was created with localhost environment values.
Use the production examples in each app folder as the source of truth.

## Recommended GoDaddy Setup

Use one of these production layouts:

1. GoDaddy Node.js Hosting or VPS for the backend API.
2. Static hosting for the customer frontend and admin frontend, or serve them from the same VPS/Nginx setup.
3. MongoDB Atlas for the database.
4. Cloudinary for property media.
5. Stripe live mode with production webhook configured.
6. Firebase production project with the live website/admin domains authorized.
7. Brevo SMTP and Telegram bot credentials in backend environment variables.

Shared static-only hosting is not enough for this app because the backend requires Node.js, MongoDB access, Stripe webhooks, Telegram notifications, and Socket.IO WebSockets.

## Required Public URLs

Example domain plan:

- Customer site: `https://your-domain.com`
- Admin panel: `https://admin.your-domain.com`
- API and Socket.IO: `https://api.your-domain.com`

Set these before building/deploying:

- `frontend/.env.production`: copy from `frontend/.env.production.example`
- `admin/.env.production`: copy from `admin/.env.production.example`
- `backend/.env`: copy production values from `backend/.env.production.example`

Important:

- `VITE_API_URL` must end with `/api/v1`.
- `VITE_SOCKET_URL` must be the backend origin without `/api/v1`.
- `FRONTEND_URL` and `ADMIN_URL` must be public HTTPS URLs.
- Do not use `localhost`, `127.0.0.1`, or plain `http://` in production.

## Build Commands

Customer frontend:

```bash
cd frontend
npm ci
npm run build
```

Admin frontend:

```bash
cd admin
npm ci
npm run build
```

Backend:

```bash
cd backend
npm ci --omit=dev
npm start
```

## Routing Support

The customer and admin apps are single page React apps. The repo now includes:

- `frontend/public/.htaccess`
- `admin/public/.htaccess`
- `frontend/nginx.conf`
- `admin/nginx.conf`
- `render.yaml`

These prevent 404 errors when refreshing deep links like `/properties/...`, `/booking/confirmation/...`, and `/admin/bookings/...`.

### Render Static Site Setup

If the customer frontend or admin panel is hosted on Render as a Static Site, `.htaccess` is not used. Add this Render Redirect/Rewrite rule in each static service:

- Source Path: `/*`
- Destination Path: `/index.html`
- Action: `Rewrite`

The root `render.yaml` also includes this rule for Blueprint-managed frontend and admin deployments. If your existing Render service has a different service name, either rename the entry in `render.yaml` to match it or add the rule manually in the Render Dashboard. After changing the rule, redeploy the static site and purge any external CDN cache in front of Render.

## External Service Settings

Stripe:

- Switch to live keys.
- Set webhook endpoint to `https://api.your-domain.com/api/v1/payments/webhook`.
- Copy the live webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

Firebase:

- Add the live customer domain and admin domain to authorized domains.
- Use production web app values in `frontend/.env.production`.
- Use Firebase Admin SDK values in backend env.

Brevo/SMTP:

- Verify sender domain/email.
- Set SMTP host, port, user, password, sender email, and sender name.

Telegram:

- Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID`.
- Set `ADMIN_URL` to the public admin URL so deep links open the admin chat dashboard.

## Smoke Test Before Client Handoff

Test these on the live domain after deployment:

- Customer signup, email verification, login, logout.
- Google/Apple auth if enabled in Firebase console.
- Property list, filters, neighborhood links, and property detail pages.
- Date calendar, day-wise prices, maintenance-blocked dates, and booking calculation.
- Booking creation, Stripe payment, redirect to booking confirmation.
- Admin booking detail page and invoice download.
- Customer invoice download.
- Contact form submission and admin contact view/reply.
- AI chat property questions with correct property links.
- Ask Admin live chat, admin reply, unread counts, and Telegram notification.
- Refresh direct URLs in customer app and admin app.
- Mobile navigation, booking flow, and chat widget.

## Current Known Gaps

- There are no backend Jest tests yet; the current `npm test` exits with no tests found.
- Lint scripts need a separate cleanup pass before they can be used as CI gates.
- Production domain values are still required before final deployment.
