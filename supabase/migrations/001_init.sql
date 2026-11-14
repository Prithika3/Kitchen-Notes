-- Kitchen Notes: initial schema
-- Run this in Supabase Dashboard > SQL Editor (or apply as a migration).

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  category text not null default 'Other',
  spent_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  quantity text,
  month text not null check (month ~ '^[0-9]{4}-[0-9]{2}$'),
  is_bought boolean not null default false,
  created_at timestamptz not null default now()
);

create index expenses_user_date_idx on public.expenses (user_id, spent_on);
create index shopping_items_user_month_idx on public.shopping_items (user_id, month);

alter table public.expenses enable row level security;
alter table public.shopping_items enable row level security;

create policy "Users manage their own expenses"
  on public.expenses
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users manage their own shopping items"
  on public.shopping_items
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
