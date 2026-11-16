-- Kitchen Notes: roles and shared access (already applied to the Supabase project)
--
-- app_roles: who may use the app.
--   editor = can view, add, edit, delete
--   viewer = view only
--   no row = no access ("Waiting for access" screen)
-- Roles are assigned by the owner in Supabase (SQL Editor), not from the app:
--   insert into public.app_roles (user_id, role)
--   select id, 'viewer' from auth.users where lower(email) = 'someone@gmail.com';

create table public.app_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.app_roles enable row level security;

create policy "Users can read their own role"
  on public.app_roles for select to authenticated
  using (user_id = (select auth.uid()));

drop policy "Users manage their own expenses" on public.expenses;
drop policy "Users manage their own shopping items" on public.shopping_items;

create policy "Members can view expenses"
  on public.expenses for select to authenticated
  using (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid())));

create policy "Editors can add expenses"
  on public.expenses for insert to authenticated
  with check (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'));

create policy "Editors can update expenses"
  on public.expenses for update to authenticated
  using (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'))
  with check (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'));

create policy "Editors can delete expenses"
  on public.expenses for delete to authenticated
  using (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'));

create policy "Members can view shopping items"
  on public.shopping_items for select to authenticated
  using (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid())));

create policy "Editors can add shopping items"
  on public.shopping_items for insert to authenticated
  with check (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'));

create policy "Editors can update shopping items"
  on public.shopping_items for update to authenticated
  using (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'))
  with check (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'));

create policy "Editors can delete shopping items"
  on public.shopping_items for delete to authenticated
  using (exists (select 1 from public.app_roles r where r.user_id = (select auth.uid()) and r.role = 'editor'));
