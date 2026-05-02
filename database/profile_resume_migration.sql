alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists age text;
alter table public.profiles add column if not exists target_role text;
alter table public.profiles add column if not exists summary text;
alter table public.profiles add column if not exists photo_url text;

create table if not exists public.education_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  school text not null,
  major text,
  degree text,
  date text,
  coursework text[],
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.internship_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company text not null,
  title text,
  date text,
  bullets text[],
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.award_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.education_entries enable row level security;
alter table public.internship_entries enable row level security;
alter table public.award_entries enable row level security;

drop policy if exists "Users can view own education entries" on public.education_entries;
create policy "Users can view own education entries" on public.education_entries
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own education entries" on public.education_entries;
create policy "Users can insert own education entries" on public.education_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own education entries" on public.education_entries;
create policy "Users can update own education entries" on public.education_entries
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own education entries" on public.education_entries;
create policy "Users can delete own education entries" on public.education_entries
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own internship entries" on public.internship_entries;
create policy "Users can view own internship entries" on public.internship_entries
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own internship entries" on public.internship_entries;
create policy "Users can insert own internship entries" on public.internship_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own internship entries" on public.internship_entries;
create policy "Users can update own internship entries" on public.internship_entries
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own internship entries" on public.internship_entries;
create policy "Users can delete own internship entries" on public.internship_entries
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own award entries" on public.award_entries;
create policy "Users can view own award entries" on public.award_entries
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own award entries" on public.award_entries;
create policy "Users can insert own award entries" on public.award_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own award entries" on public.award_entries;
create policy "Users can update own award entries" on public.award_entries
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own award entries" on public.award_entries;
create policy "Users can delete own award entries" on public.award_entries
  for delete using (auth.uid() = user_id);
