# Stay Wise Hostinger VPS Deployment

This setup runs the MERN app on one Hostinger VPS using Docker Compose and host-level Nginx:

- `https://www.staywise.miami` -> frontend container
- `https://api.staywise.miami` -> backend Express + Socket.IO container
- `https://admin.staywise.miami` -> admin dashboard container

## 1. Initial VPS Setup

In Hostinger hPanel, click **Setup** on the VPS and choose Ubuntu 24.04 LTS or Ubuntu 22.04 LTS. Set a strong root password or SSH key.

After Hostinger shows the VPS IPv4 address, connect:

```bash
ssh root@YOUR_VPS_IP
```

Run the base installer:

```bash
apt-get update
apt-get install -y git
git clone YOUR_REPO_URL /var/www/staywise
cd /var/www/staywise
bash deploy/hostinger/bootstrap-ubuntu.sh
```

## 2. DNS Records

Point these A records to the VPS IPv4 address:

```txt
@      A  YOUR_VPS_IP
www    A  YOUR_VPS_IP
api    A  YOUR_VPS_IP
admin  A  YOUR_VPS_IP
```

Keep email DNS records unchanged if email is already working. DNS propagation can take up to 24 hours.

## 3. Environment Files

Create the frontend/admin build env:

```bash
cd /var/www/staywise
cp .env.hostinger.example .env.hostinger
nano .env.hostinger
```

Create the backend runtime env:

```bash
cp backend/.env.production.example backend/.env
nano backend/.env
```

Required backend production values include:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_*`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_*`
- `BREVO_*`
- `FIREBASE_*`
- `GEMINI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- `FRONTEND_URL=https://www.staywise.miami`
- `ADMIN_URL=https://admin.staywise.miami`

For MongoDB Atlas, allow the VPS IP in Network Access.

## 4. Start Docker Services

```bash
docker compose -f docker-compose.hostinger.yml --env-file .env.hostinger up -d --build
docker compose -f docker-compose.hostinger.yml ps
```

Check backend logs:

```bash
docker compose -f docker-compose.hostinger.yml logs -f backend
```

## 5. Configure Nginx Before SSL

```bash
cp deploy/hostinger/nginx/staywise-http.conf /etc/nginx/sites-available/staywise
ln -sf /etc/nginx/sites-available/staywise /etc/nginx/sites-enabled/staywise
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Test:

```bash
curl http://api.staywise.miami/health
```

## 6. Install SSL

Run Certbot after DNS points to the VPS:

```bash
certbot --nginx \
  -d staywise.miami \
  -d www.staywise.miami \
  -d api.staywise.miami \
  -d admin.staywise.miami
```

Then replace the Nginx config with the final HTTPS config:

```bash
cp deploy/hostinger/nginx/staywise-ssl.conf /etc/nginx/sites-available/staywise
nginx -t
systemctl reload nginx
```

## 7. Production Checks

```bash
curl -I https://www.staywise.miami
curl https://api.staywise.miami/health
curl https://www.staywise.miami/sitemap.xml
docker compose -f docker-compose.hostinger.yml ps
```

Update Stripe webhook destination:

```txt
https://api.staywise.miami/api/v1/payments/webhook
```

Add Firebase authorized domains:

```txt
staywise.miami
www.staywise.miami
admin.staywise.miami
```

## 8. Future Deploys

```bash
cd /var/www/staywise
bash deploy/hostinger/deploy.sh
```

## Hostinger References

- VPS SSH details are available from hPanel VPS overview, and Hostinger uses `root` for VPS SSH access by default: https://www.hostinger.com/support/5723772-how-to-connect-to-your-vps-via-ssh-at-hostinger/
- Hostinger recommends pointing VPS domains with A records for `@` and `www`, and DNS propagation may take up to 24 hours: https://www.hostinger.com/support/1583227-how-to-point-a-domain-to-your-vps-at-hostinger/
- Open the Hostinger VPS firewall for SSH, HTTP, and HTTPS: https://www.hostinger.com/support/8172641-how-to-use-a-managed-vps-firewall-at-hostinger/
