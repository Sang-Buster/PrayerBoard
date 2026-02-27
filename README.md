# Prayer Wall

A clean, warm-minimalist prayer request web application. Users can submit prayer requests (named or anonymous) and admins can view requests and statistics through a password-protected dashboard.

**Tech Stack:** Next.js 14+ (App Router) · TypeScript · Tailwind CSS v4 · Vercel Postgres · Recharts · Lucide Icons

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in values (see Environment Variables below)
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The app requires a Vercel Postgres database even locally. You can pull connection strings from Vercel after setting up the project (see below), or use `vercel env pull .env.local` with the Vercel CLI.

---

## Deploying to Vercel — Step by Step

### 1. Import the Repository

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New…" → "Project"**
3. Find **PrayerBoard** in your GitHub repos and click **Import**
4. Leave the framework preset as **Next.js** (auto-detected)
5. **Don't deploy yet** — first add the database and environment variables (steps 2–3)

### 2. Add a Postgres Database

1. In your Vercel dashboard, go to the **Storage** tab (top nav)
2. Click **"Create Database"** → select **Neon Serverless Postgres** (free tier available)
3. Name it something like `prayer-db`, pick a region close to your users, then click **Create**
4. After creation, click **"Connect to Project"** and select your **PrayerBoard** project
5. Vercel will automatically inject `POSTGRES_URL` (and related vars) into your project's environment — no manual copy needed

### 3. Set Environment Variables

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add these two variables for **all environments** (Production, Preview, Development):

| Variable | Value | How to Generate |
|---|---|---|
| `ADMIN_PASSWORD` | Your chosen admin password | Pick any strong password |
| `AUTH_SECRET` | A 64-character hex string | Run `openssl rand -hex 32` in your terminal |

3. `POSTGRES_URL` should already be set from Step 2 — verify it appears in the list

### 4. Deploy

1. Go to the **Deployments** tab and click **"Redeploy"** (or push a new commit to trigger a build)
2. Wait for the build to complete (~1–2 minutes)

### 5. Initialize the Database

After the first successful deployment, you need to create the database table:

1. **Log in as admin first** — visit `https://your-app.vercel.app/admin` and enter your `ADMIN_PASSWORD`
2. **Run the setup** — with the admin cookie set, make a POST request to the setup endpoint:
   ```bash
   # Replace with your actual Vercel URL and admin cookie
   curl -X POST https://your-app.vercel.app/api/setup \
     -H "Cookie: admin_token=YOUR_COOKIE_VALUE"
   ```
   
   **Easier alternative:** Open your browser's dev console while on the admin dashboard and run:
   ```js
   fetch('/api/setup', { method: 'POST' }).then(r => r.json()).then(console.log)
   ```
   You should see: `{ "success": true, "message": "Database setup completed successfully." }`

### 6. Verify Everything Works

- **Public form:** Visit your app's root URL → submit a test prayer request
- **Admin login:** Visit `/admin` → enter your `ADMIN_PASSWORD`
- **Dashboard:** After login, you'll see stats and the prayer list at `/admin/dashboard`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_URL` | Yes | Vercel Postgres connection string (auto-set by Vercel when you connect a database) |
| `ADMIN_PASSWORD` | Yes | Password for the admin dashboard |
| `AUTH_SECRET` | Yes | Random secret for signing auth tokens — generate with `openssl rand -hex 32` |

---

## Project Structure

```
app/
  layout.tsx              → Root layout (Lora + DM Sans fonts, metadata, footer)
  page.tsx                → Public prayer submission form
  admin/
    page.tsx              → Admin login page
    dashboard/
      page.tsx            → Admin dashboard (protected)
      loading.tsx         → Dashboard skeleton loading UI
  api/
    prayers/route.ts      → POST (public submit) & GET (auth'd list)
    auth/route.ts         → POST login
    logout/route.ts       → POST logout
    stats/route.ts        → GET dashboard stats (auth'd)
    setup/route.ts        → POST database migration (auth'd, one-time)
components/
  ui/                     → shadcn-style primitives (Button, Card, Input, Textarea, Badge)
  prayer-form.tsx         → Public submission form (client component)
  dashboard-client.tsx    → Dashboard wrapper (client component)
  stats-cards.tsx         → Stats grid with icons
  prayer-chart.tsx        → 30-day Recharts area chart
  prayer-list.tsx         → Paginated prayer request list
lib/
  utils.ts                → cn() helper, timeAgo() formatter
  db.ts                   → Vercel Postgres query functions
  auth.ts                 → HMAC token signing/verification, cookie helpers
```

---

## Custom Domain (Optional)

1. In your Vercel project, go to **Settings → Domains**
2. Add your custom domain (e.g., `prayers.yourchurch.org`)
3. Follow Vercel's instructions to update your DNS records
4. SSL is automatic

