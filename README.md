This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

npx @insforge/cli db import scratch.sql;

insforge database query:
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  "slugId" TEXT NOT NULL UNIQUE,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE "Role" AS ENUM ('assistant', 'system', 'user');

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role "Role" NOT NULL,
  parts JSONB NOT NULL,
  "projectId" UUID REFERENCES projects(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  "rootStyles" TEXT NOT NULL,
  "htmlContent" TEXT NOT NULL,
  "projectId" UUID REFERENCES projects(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Enable uuid generation (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Page version history table (no FK constraint — avoids type mismatch)
CREATE TABLE IF NOT EXISTS page_versions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "pageId"        TEXT        NOT NULL,
  "htmlContent"   TEXT        NOT NULL,
  "rootStyles"    TEXT        NOT NULL DEFAULT '',
  "versionNumber" INTEGER     NOT NULL DEFAULT 1,
  label           TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-page lookups
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id
  ON page_versions ("pageId", "versionNumber" DESC);

## Stripe — Required DB Migration

Run this in the Insforge SQL editor to create the `user_credits` table:

```sql
-- Create user_credits table with Stripe support
CREATE TABLE IF NOT EXISTS user_credits (
  "userId"            TEXT        PRIMARY KEY,
  used                INTEGER     NOT NULL DEFAULT 0,
  "resetAt"           TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  plan                TEXT        NOT NULL DEFAULT 'free',
  "stripeCustomerId"  TEXT,
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for Stripe webhook lookups (customer → user)
CREATE INDEX IF NOT EXISTS idx_user_credits_stripe_customer
  ON user_credits ("stripeCustomerId");
```

> If you already created `user_credits` without the Stripe column, run this instead:
> ```sql
> ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
> CREATE INDEX IF NOT EXISTS idx_user_credits_stripe_customer ON user_credits ("stripeCustomerId");
> ```

## Stripe Setup Checklist

1. Create a Stripe account at https://stripe.com
2. Create two products in the Stripe Dashboard:
   - **Zephio Pro** — $12/month recurring → copy the Price ID → `STRIPE_PRICE_PRO_MONTHLY`
   - **Zephio Team** — $29/month recurring → copy the Price ID → `STRIPE_PRICE_TEAM_MONTHLY`
3. Copy your Secret Key → `STRIPE_SECRET_KEY`
4. Add a webhook endpoint in Stripe Dashboard → Webhooks:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`
5. For local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Project Folders — Required DB Migration

Run this in the Insforge SQL editor to add folder support:

```sql
-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT 'gray',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders ("userId");

-- Add folderId column to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS "folderId" UUID REFERENCES folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_folder_id ON projects ("folderId");
```

### Folder API Routes
- `GET /api/folders` — list all folders for the current user
- `POST /api/folders` — create a folder `{ name, color }`
- `PATCH /api/folders/[folderId]` — rename or recolor `{ name?, color? }`
- `DELETE /api/folders/[folderId]` — delete folder (projects become unfiled)

### Folder Server Actions (in `app/action/dashboard-actions.ts`)
- `createFolderAction(name, color)`
- `renameFolderAction(folderId, name)`
- `recolorFolderAction(folderId, color)`
- `deleteFolderAction(folderId)`
- `moveProjectToFolderAction(projectId, folderId | null)`
