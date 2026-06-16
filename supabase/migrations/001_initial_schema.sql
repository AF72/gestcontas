-- GestContas initial schema
-- Already applied in Supabase dashboard

create extension if not exists "pgcrypto";

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_number text not null,
  created_at timestamptz default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('expense', 'income')),
  created_at timestamptz default now()
);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  symbol text not null,
  created_at timestamptz default now()
);

create table public.movements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  type text not null check (type in ('credit', 'debit')),
  category_id uuid references public.categories(id) on delete set null,
  label_id uuid references public.labels(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.labels enable row level security;
alter table public.movements enable row level security;

create policy "accounts_own" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_own" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "labels_own" on public.labels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "movements_own" on public.movements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
