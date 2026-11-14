# Kitchen Notes

A simple app to track kitchen expenses and the monthly shopping list.

**Stack:** Next.js (App Router) · Tailwind CSS · shadcn/ui · Supabase (Auth + Postgres)

## Features

- Email + password login (each user only sees their own data via Row Level Security)
- **Expenses**: add what was bought, amount, category, date; see the monthly total and category totals
- **Monthly list**: items to buy each month, tick them off when bought, copy last month's list in one tap
- Month picker to view any month

## Setup (PowerShell)

1. Install packages:

   ```powershell
   cd C:\Users\Acer\OneDrive\Desktop\Prithi-next-js
   npm install
   ```

2. Make sure the Supabase project is **active** (restore it in the Supabase dashboard if it shows as paused).

3. Create the tables: open Supabase Dashboard → SQL Editor → paste the contents of
   `supabase/migrations/001_init.sql` → Run.

4. Environment variables: copy `.env.local.example` to `.env.local` and paste your key
   (Supabase Dashboard → Project Settings → API → anon / publishable key).

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

5. (Optional, easier for family use) Supabase Dashboard → Authentication → Providers → Email →
   turn off "Confirm email", so sign-up works without checking an inbox.

6. Run:

   ```powershell
   npm run dev
   ```

   Open http://localhost:3000

## Customising

- Currency symbol: `CURRENCY` in `lib/utils.ts`
- Expense categories: `CATEGORIES` in `components/expenses.tsx`
