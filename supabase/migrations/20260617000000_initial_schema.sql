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

-- 5. 회원정보 수정 시 updatedAt 컬럼이 자동으로 현재 시간으로 갱신되도록 트리거 함수와 트리거를 설정합니다.
-- PostgreSQL은 테이블 데이터가 변경(update)될 때 자동으로 시간을 변경해주지 않으므로, 
-- 업데이트 시점을 기록할 트리거 함수와 트리거를 수동으로 지정해 줍니다.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now(); -- 변경 대상 행의 updatedAt 값을 현재 시간으로 갱신합니다.
  return new;
end;
$$ language plpgsql;

-- 기존 트리거가 존재할 경우 중복 방지를 위해 삭제합니다.
drop trigger if exists set_updated_at_profiles on public."babyFoodProfiles";

-- babyFoodProfiles 테이블에 update 이벤트가 발생하기 직전(before update)에 트리거 함수를 실행하도록 설정합니다.
create trigger set_updated_at_profiles
  before update on public."babyFoodProfiles"
  for each row
  execute function public.set_updated_at();
