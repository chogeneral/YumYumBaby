-- ============================================================================
-- 베베레시피 통합 데이터베이스 구축 스크립트 (최초 1회 실행)
-- 회원관리(babyFoodProfiles), 행동로그(pattern_logs), 레시피후기(recipe_reviews)
-- ============================================================================

-- 테스트 회원 비밀번호 암호화(crypt, gen_salt)를 원활히 처리할 수 있도록 pgcrypto 데이터베이스 확장을 활성화합니다.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. babyFoodProfiles — 회원 프로필 테이블
-- ----------------------------------------------------------------------------
-- 기존 테이블과 연결된 종속성들을 깔끔하게 삭제 후 재생성하기 위해 CASCADE를 적용합니다.
DROP TABLE IF EXISTS public."babyFoodProfiles" CASCADE;

-- React 소스코드(App.jsx)가 대소문자가 섞인 이름("babyFoodProfiles", "babyName", "babyBirth")으로
-- 데이터 조회 및 입력을 수행하므로, PostgreSQL에서 소문자로 자동 치환되어 에러가 발생하는 것을 방지하기 위해 
-- 테이블명 및 해당 컬럼명을 반드시 쌍따옴표("")로 감싸 명시적으로 정의합니다.
CREATE TABLE public."babyFoodProfiles" (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text NOT NULL,
  "babyName" text NOT NULL,
  "babyBirth" text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 생성된 테이블에 대해 Supabase의 외부 API 접근 역할(anon, authenticated)이 데이터에 접근할 수 있도록 
-- 테이블 수준 전체 권한을 안전하게 부여합니다.
GRANT ALL ON TABLE public."babyFoodProfiles" TO postgres, anon, authenticated, service_role;

-- 비인가 사용자의 임의 타인 프로필 변조를 보호하고 안전한 액세스 통제를 위해 행 레벨 보안(RLS)을 활성화합니다.
ALTER TABLE public."babyFoodProfiles" ENABLE ROW LEVEL SECURITY;

-- [정책 1]: 비로그인 사용자가 가입한 계정을 찾기 위해 부모 이름과 아기 이름으로 이메일을 조회할 수 있도록
-- 조회(SELECT) 권한을 전체 오픈합니다. (이메일 찾기 기능 지원용)
DROP POLICY IF EXISTS "누구나 프로필 조회 가능" ON public."babyFoodProfiles";
CREATE POLICY "누구나 프로필 조회 가능" ON public."babyFoodProfiles"
  FOR SELECT USING (true);

-- [정책 2]: 회원가입 직후, 새로 생성된 자신의 auth.users 계정 식별자(auth.uid())와 동일한 id 값으로만
-- 프로필 행을 생성할 수 있도록 보안 규칙을 지정합니다.
DROP POLICY IF EXISTS "본인 프로필 등록 가능" ON public."babyFoodProfiles";
CREATE POLICY "본인 프로필 등록 가능" ON public."babyFoodProfiles"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- [정책 3]: 본인이 로그인한 상태에서만 자신의 마이페이지 정보를 수정(UPDATE)할 수 있도록,
-- 세션 식별자와 프로필 행의 id 값을 대조하여 제한을 부여합니다.
DROP POLICY IF EXISTS "본인 프로필만 수정 가능" ON public."babyFoodProfiles";
CREATE POLICY "본인 프로필만 수정 가능" ON public."babyFoodProfiles"
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- [정책 4]: 회원 탈퇴 시 자신의 정보에 한해서만 삭제(DELETE) 명령을 실행할 수 있도록 접근 권한을 제한합니다.
DROP POLICY IF EXISTS "본인 프로필만 삭제 가능" ON public."babyFoodProfiles";
CREATE POLICY "본인 프로필만 삭제 가능" ON public."babyFoodProfiles"
  FOR DELETE USING (auth.uid() = id);


-- ----------------------------------------------------------------------------
-- 2. recipe_reviews — 레시피 후기 댓글 테이블
-- ----------------------------------------------------------------------------
-- 깨끗한 재생성을 위해 기존 댓글 테이블이 있다면 CASCADE 옵션을 주어 먼저 완전 삭제합니다.
DROP TABLE IF EXISTS public.recipe_reviews CASCADE;

-- 비로그인(익명) 사용자도 후기 작성을 수행할 수 있도록, user_id 컬럼의 NOT NULL 제한을 제거하여 NULL을 허용합니다.
CREATE TABLE public.recipe_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Supabase REST API 통신 환경에서 읽기 및 쓰기가 정상 수신되도록 접근 권한을 명시합니다.
GRANT ALL ON TABLE public.recipe_reviews TO postgres, anon, authenticated, service_role;

-- 비정상적인 악성 데이터를 수동 변조할 수 없도록 행 레벨 보안(RLS)을 켭니다.
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;

-- [정책 1]: 비로그인 사용자를 포함한 모든 사용자가 레시피 모달 창에서 댓글 내용을 열람할 수 있게 조회 권한을 엽니다.
DROP POLICY IF EXISTS "누구나 후기 조회" ON public.recipe_reviews;
CREATE POLICY "누구나 후기 조회" ON public.recipe_reviews
  FOR SELECT USING (true);

-- [정책 2]: 누구나 후기 작성이 가능하지만, 로그인한 사용자는 자신의 식별자(user_id)로 올려야 하며,
-- 비로그인 사용자는 user_id가 반드시 NULL이어야 다른 사람의 식별자를 사칭할 수 없도록 방어 정책을 수립합니다.
DROP POLICY IF EXISTS "로그인 사용자만 작성" ON public.recipe_reviews;
DROP POLICY IF EXISTS "누구나 후기 작성 가능" ON public.recipe_reviews;
CREATE POLICY "누구나 후기 작성 가능" ON public.recipe_reviews
  FOR INSERT WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR
    (auth.uid() = user_id)
  );

-- [정책 3]: 본인이 작성한 소중한 의견이 타인에 의해 유실되는 것을 막기 위해, 작성자의 세션 식별자와 일치하는 로우만 지우도록 가로막습니다. (비로그인 댓글은 본인 인증 수단이 없으므로 삭제 대상에서 기본 제외)
DROP POLICY IF EXISTS "본인 후기만 삭제" ON public.recipe_reviews;
CREATE POLICY "본인 후기만 삭제" ON public.recipe_reviews
  FOR DELETE USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 3. pattern_logs — 행동 패턴 분석 기록 테이블
-- ----------------------------------------------------------------------------
-- 분석 행동 기록 테이블이 존재하지 않을 시에만 생성합니다.
CREATE TABLE IF NOT EXISTS public.pattern_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  category_id text,
  at_ms bigint,
  child_index smallint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 앱(Next.js 패턴 기록 API)과의 정렬을 위해 child_index 열이 테이블에 보장되도록 안전 장치용으로 필드를 강제 추가합니다.
ALTER TABLE public.pattern_logs
  ADD COLUMN IF NOT EXISTS child_index smallint NOT NULL DEFAULT 0;

-- 칼럼의 성격을 명확히 이해하고 유지보수할 수 있게 메타 코멘트를 기입합니다.
COMMENT ON COLUMN public.pattern_logs.child_index IS '앱 PatternLogEntry.childIndex — 아이 탭 인덱스(0~4)';

-- 통계 로그가 외부에서 API를 거쳐 원활히 수집(Insert)될 수 있게 모든 롤 권한을 승인합니다.
GRANT ALL ON TABLE public.pattern_logs TO postgres, anon, authenticated, service_role;

-- 데이터 무단 위조 방지를 위해 일단 행 레벨 보안(RLS)을 적용합니다.
ALTER TABLE public.pattern_logs ENABLE ROW LEVEL SECURITY;

-- [정책 1]: 익명 기록 로깅을 지원하고 전체 분석 데이터를 적재하기 위해, 모든 동작(조회/삽입 등)을 전격 허용합니다.
DROP POLICY IF EXISTS "pattern_logs_all_anon" ON public.pattern_logs;
CREATE POLICY "pattern_logs_all_anon"
  ON public.pattern_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 분석 통계 조회 성능을 비약적으로 가속화하기 위해 자주 조회 정렬되는 필드들로 결합 복합 인덱스를 구성합니다.
CREATE INDEX IF NOT EXISTS idx_pattern_logs_user_child_at
  ON public.pattern_logs (user_email, child_index, at_ms DESC);

CREATE INDEX IF NOT EXISTS idx_pattern_logs_user_child_cat_at
  ON public.pattern_logs (user_email, child_index, category_id, at_ms DESC);


-- ----------------------------------------------------------------------------
-- 4. 테스트 로그인 계정 연동 가이드
-- ----------------------------------------------------------------------------
-- [필독] Supabase Auth의 보안 정책상, SQL Editor에서 auth.users 테이블에 직접 비밀번호를
-- 암호화하여 인서트하게 되면 Supabase 내부 인증 서비스의 암호 알고리즘 규격(Bcrypt 비용 등) 및
-- 고유 식별자(Instance ID) 매칭에 실패하여, 에러 메시지 없이 로그인이 무조건 실패(차단)할 수 있습니다.
-- 따라서 가장 안전하고 100% 정상 작동하는 테스트 계정 생성 및 연동을 아래 방법으로 가이드합니다.
--
-- [1단계]: Supabase 웹 대시보드(https://supabase.com/dashboard/project/nrzcycednfohxybspscn) 접속
-- [2단계]: 왼쪽 자물쇠 아이콘인 "Authentication" -> "Users" 탭으로 이동합니다.
-- [3단계]: 우측 상단의 "Add user" -> "Create user"를 클릭해 아래 정보로 계정을 생성합니다.
--          - Email: test@test.com
--          - Password: 원하는 비밀번호 (예: 123456)
--          - Auto-confirm User 옵션 체크 (체크해야 인증 절차 없이 즉시 로그인이 가능합니다.)
-- [4단계]: 생성 완료된 유저 목록에서 해당 이메일의 "User ID" (UUID 형식의 긴 식별자)를 드래그 복사합니다.
-- [5단계]: 복사한 ID를 가지고 아래 쿼리 중 '복사한_ID_여기에_붙여넣기' 부분만 실제 ID로 바꿔서 SQL Editor에서 실행(Run)해 줍니다.
--
-- INSERT INTO public."babyFoodProfiles" (
--   id,
--   username,
--   "babyName",
--   "babyBirth",
--   email,
--   created_at
-- )
-- VALUES (
--   '복사한_ID_여기에_붙여넣기', -- <-- [4단계]에서 복사한 UUID를 이 자리에 넣으세요!
--   '베베맘',
--   '튼튼이',
--   '2025-05-05',
--   'test@test.com',
--   now()
-- )
-- ON CONFLICT (id) DO NOTHING;
