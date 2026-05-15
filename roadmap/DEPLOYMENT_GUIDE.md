# LearnFlow — Vercel Deployment Guide

A step-by-step guide to deploy LearnFlow to Vercel using your existing GitHub repo, Supabase database, and environment variables.

---

## Prerequisites ✅

- ✅ Code pushed to GitHub
- ✅ Supabase database (already set up)
- ✅ Environment variables (already configured)
- ✅ Vercel account ([vercel.com](https://vercel.com) — sign in with GitHub)

---

## Step 1: Create Prisma Migrations

Your Prisma schema needs migrations before Vercel can build. Run this locally:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Create the initial migration
npx prisma migrate dev --name init
```

This creates the `prisma/migrations/` folder. Now commit and push:

```bash
git add prisma/migrations/
git commit -m "Add initial database migration"
git push
```

> ⚠️ **Why this is necessary:** Vercel runs `npx prisma generate` during build, but `prisma migrate dev` creates migration files that tell Prisma what your database schema looks like. Without these files, the database won't have the correct tables.

---

## Step 2: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add New Project"**
3. Find and select your `learnflow` GitHub repository
4. Click **"Import"**

---

## Step 3: Configure Build Settings

Vercel auto-detects Next.js, but you need to customize the build command:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js *(auto-detected)* |
| **Root Directory** | `./` *(default)* |
| **Build Command** | `npx prisma generate && next build` |
| **Output Directory** | `.next` *(default)* |
| **Install Command** | `npm install` *(default)* |

> 🔑 **Build Command explanation:** The `npx prisma generate` step generates the Prisma client types, which is required before Next.js can compile the TypeScript code that imports from `@prisma/client`.

---

## Step 4: Add Environment Variables

In the Vercel project dashboard, go to **Settings → Environment Variables** and add these:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Your Supabase connection string |
| `NEXTAUTH_URL` | `https://<your-app>.vercel.app` | Your Vercel deployment URL |
| `NEXTAUTH_SECRET` | `your-secret-key` | A random 32+ character string |
| `GROQ_API_KEY` | `gsk_...` | Your Groq API key |
| `NODE_ENV` | `production` | |

> ⚠️ **Important for Supabase users:** Use the **Connection Pooling** string (port **6543**, not 5432) for `DATABASE_URL` — this is better for Vercel's serverless environment.

> 🔐 **NEXTAUTH_SECRET:** Generate with `openssl rand -base64 32` in your terminal, or use any random 32-character string.

> 🔗 **NEXTAUTH_URL:** This must be the exact Vercel domain (e.g., `https://learnflow.vercel.app`). You'll see it after the first deployment, or set it in Vercel dashboard → **Settings → Domains**.

---

## Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for the build (~2-3 minutes)
3. Vercel will show a live URL when complete (e.g., `https://learnflow-xxxxx.vercel.app`)

---

## Step 6: Run Database Migrations on Production

After deployment, the database has no tables yet. Run the migration against your production database:

```bash
# Using your production DATABASE_URL (the direct connection, port 5432)
npx prisma migrate deploy
```

Or if you prefer, set the env variable inline:

```bash
# Windows (Command Prompt)
set DATABASE_URL=postgresql://... && npx prisma migrate deploy

# Windows (PowerShell)
$env:DATABASE_URL="postgresql://..." ; npx prisma migrate deploy
```

> 💡 **Why `prisma migrate deploy` instead of `dev`?** `deploy` applies pending migrations without resetting data or asking questions — it's the safe choice for production.

---

## Step 7: Seed Demo Data (Optional)

Want test accounts? Run the seed script against production:

```bash
cd scripts
npx tsx seed-courses.ts
```

Or from the project root:

```bash
npx tsx scripts/seed-courses.ts
```

This creates courses so you can immediately test the app.

---

## Step 8: Update NEXTAUTH_URL (If Needed)

After the first deployment, you'll know your Vercel URL. If it differs from what you entered earlier:

1. Go to **Vercel Dashboard → Settings → Environment Variables**
2. Update `NEXTAUTH_URL` to the correct URL (e.g., `https://learnflow-xxxxx.vercel.app`)
3. Go to the **Deployments** tab
4. Click the three dots (⋮) on the latest deployment → **Redeploy**

---

## Step 9: Verify Everything Works

Visit your live URL and test the core flows:

- [ ] **Homepage** loads correctly
- [ ] **Register** as an educator → redirected
- [ ] **Register** as a learner → redirected
- [ ] **Login** with credentials → redirected to correct dashboard
- [ ] **Create a course** → appears in educator dashboard
- [ ] **Add a lesson** with a YouTube URL → video embeds
- [ ] **Generate a quiz** → AI produces questions
- [ ] **Courses page** (`/courses`) → shows published courses
- [ ] **Enroll** in a course as a learner
- [ ] **Complete a lesson** → progress updates
- [ ] **Take a quiz** → score calculated
- [ ] **Learner dashboard** → shows stats

---

## Quick Reference: Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:6543/database"  # Use pooler port 6543
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-random-secret-here"
GROQ_API_KEY="gsk_your-groq-api-key"
NODE_ENV="production"
```

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| **Build fails: "Prisma Client not found"** | Missing `npx prisma generate` in build command | Set build command to `npx prisma generate && next build` |
| **Build fails: "Relation does not exist"** | No migrations run on database | Run `npx prisma migrate deploy` |
| **Login doesn't work** | Wrong `NEXTAUTH_URL` | Update to match your exact Vercel domain |
| **Session doesn't persist** | Missing or inconsistent `NEXTAUTH_SECRET` | Set a consistent secret in Vercel env vars |
| **"Database does not exist"** | Wrong connection string | Verify `DATABASE_URL` points to your Supabase instance |
| **Quiz generation fails** | Groq API key missing | Add `GROQ_API_KEY` to Vercel env vars |
| **Images not loading** | No image domains configured | Add domains to `next.config.ts` |
| **Blank page / 500 error** | Unhandled runtime error | Check Vercel deployment logs → **Functions** tab |

---

## Deployment Checklist

- [ ] Prisma migrations created and pushed
- [ ] Project imported on Vercel
- [ ] Build command: `npx prisma generate && next build`
- [ ] All environment variables set
- [ ] Database migrations deployed (`npx prisma migrate deploy`)
- [ ] Login flow works on production URL
- [ ] Core features tested

---

*LearnFlow — Last updated: ${new Date().toISOString().split('T')[0]}*
