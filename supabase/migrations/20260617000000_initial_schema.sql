-- =============================================
-- 베베레시피 초기 스키마
-- =============================================

-- 1. profiles 테이블 (Supabase Auth 와 1:1 연결)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  parent_name text not null,
  baby_name   text not null unique,
  baby_birth  date not null,
  created_at  timestamptz default now()
);

-- RLS 활성화 — 본인 데이터만 접근 가능
alter table public.profiles enable row level security;

create policy "본인 프로필 조회" on public.profiles
  for select using (auth.uid() = id);

create policy "본인 프로필 등록" on public.profiles
  for insert with check (auth.uid() = id);

create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);

create policy "본인 프로필 삭제" on public.profiles
  for delete using (auth.uid() = id);

-- 2. 회원가입 시 자동으로 profiles 행을 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, parent_name, baby_name, baby_birth)
  values (
    new.id,
    new.raw_user_meta_data->>'parent_name',
    new.raw_user_meta_data->>'baby_name',
    (new.raw_user_meta_data->>'baby_birth')::date
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. recipes 테이블
create table if not exists public.recipes (
  id           text primary key,
  stage        text not null check (stage in ('early', 'middle', 'late')),
  name         text not null,
  description  text not null,
  ingredients  text not null,
  instructions text[] not null,
  tips         text not null,
  created_at   timestamptz default now()
);

-- 레시피는 로그인 없이 누구나 조회 가능 (공개 데이터)
alter table public.recipes enable row level security;

create policy "레시피 전체 공개 조회" on public.recipes
  for select using (true);
