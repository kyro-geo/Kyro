-- Kyro M10 billing tables. Run once in the Supabase SQL editor.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','starter','pro')),
  provider text check (provider in ('stripe','payfast')),
  status text not null default 'active',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('stripe','payfast')),
  plan text not null,
  amount integer not null,          -- usd cents for stripe, whole PKR for payfast
  currency text not null,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  provider_ref text,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
create policy "own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "own payments" on public.payments for select using (auth.uid() = user_id);
-- Writes happen only with the service role key (webhook / IPN routes), so no insert/update policies.

-- Newer Supabase projects don't auto-grant table access; without these the routes get "permission denied".
grant select, insert, update, delete on public.subscriptions, public.payments to service_role;
grant select on public.subscriptions, public.payments to authenticated;
