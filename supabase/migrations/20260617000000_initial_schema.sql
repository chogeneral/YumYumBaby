-- =============================================
-- 베베레시피 초기 스키마
-- =============================================

-- babyFoodProfiles 테이블 (Supabase Auth 와 1:1 연결)
create table if not exists public."babyFoodProfiles" (
  id          uuid references auth.users on delete cascade primary key,
  username    text not null,
  "babyName"  text not null,
  "babyBirth" date not null,
  email       text,
  "updatedAt" timestamptz not null default now(),
  "createdAt" timestamptz not null default now()
);

-- RLS 활성화
alter table public."babyFoodProfiles" enable row level security;

-- 기존 정책이 있으면 삭제 후 재생성 (재실행 시 오류 방지)
drop policy if exists "Allow public select on profiles" on public."babyFoodProfiles";
drop policy if exists "Allow individuals to insert their own profile" on public."babyFoodProfiles";
drop policy if exists "Allow individuals to update their own profiles" on public."babyFoodProfiles";
drop policy if exists "Allow individuals to delete their own profile" on public."babyFoodProfiles";

-- SELECT 정책
create policy "Allow public select on profiles"
  on public."babyFoodProfiles"
  for select using (true);

-- INSERT 정책
create policy "Allow individuals to insert their own profile"
  on public."babyFoodProfiles"
  for insert with check (auth.uid() = id);

-- UPDATE 정책
create policy "Allow individuals to update their own profiles"
  on public."babyFoodProfiles"
  for update using (auth.uid() = id);

-- DELETE 정책
create policy "Allow individuals to delete their own profile"
  on public."babyFoodProfiles"
  for delete using (auth.uid() = id);
