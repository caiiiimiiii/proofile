-- 用户表（由 Supabase Auth 自动管理，但可以创建一张 profile 表扩展）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamp with time zone default now()
);

-- 项目表
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  role text,
  description text,
  skills text[],  -- 技能标签数组
  result text,     -- 项目成果描述
  date text,       -- 项目时间，如 "2025.03-2025.06"
  created_at timestamp with time zone default now()
);

-- 开启 Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- 创建策略：用户只能操作自己的数据
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- 自动同步：Auth 新用户 → profiles
-- 说明：Supabase Auth 不会自动写 public.profiles，需用 trigger 或在应用层 upsert。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();