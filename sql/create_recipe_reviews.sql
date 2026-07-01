-- ============================================================================
-- 1. recipe_reviews (레시피 후기 테이블) 생성 및 보안/인덱스 설정
-- ============================================================================

-- 테이블이 이미 존재할 경우 무결성을 위해 캐스케이드(CASCADE) 옵션으로 삭제합니다.
DROP TABLE IF EXISTS recipereviews CASCADE;
DROP TABLE IF EXISTS "recipeReviews" CASCADE;
DROP TABLE IF EXISTS recipe_reviews CASCADE;

-- 레시피 후기를 저장하는 메인 테이블을 생성합니다.
CREATE TABLE recipe_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY, -- 후기글의 고유 식별자(ID)
  recipe_id text, -- 후기가 달릴 대상 레시피 ID
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- 작성자 고유 ID (auth.users 참조)
  username text NOT NULL, -- 작성자 이름
  category text, -- 후기 카테고리 (예: 초기/중기 등)
  title text, -- 후기 제목
  content text NOT NULL, -- 후기 본문 내용
  views integer DEFAULT 0 NOT NULL, -- 조회수 카운트를 저장할 컬럼 (기본값 0)
  created_at timestamptz DEFAULT now() -- 생성 일시
);

-- RLS (Row Level Security) 활성화

ALTER TABLE recipe_reviews ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 후기 게시글을 조회할 수 있도록 허용합니다.
DROP POLICY IF EXISTS "누구나 후기 조회" ON recipe_reviews;
CREATE POLICY "누구나 후기 조회" ON recipe_reviews
  FOR SELECT USING (true);

-- 정책: 로그인한 인증 유저만 본인 명의로 후기글을 작성할 수 있도록 제한합니다.
DROP POLICY IF EXISTS "로그인 사용자만 작성" ON recipe_reviews;
CREATE POLICY "로그인 사용자만 작성" ON recipe_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 정책: 작성자 본인만 후기글을 삭제할 수 있도록 제한합니다.
DROP POLICY IF EXISTS "본인 후기만 삭제" ON recipe_reviews;
CREATE POLICY "본인 후기만 삭제" ON recipe_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 정책: 작성자 본인만 후기글을 수정할 수 있도록 업데이트 권한을 제어합니다.
DROP POLICY IF EXISTS "본인 후기만 수정" ON recipe_reviews;
CREATE POLICY "본인 후기만 수정" ON recipe_reviews
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 레시피 ID 기반의 후기 목록을 최신 등록순으로 빠르게 정렬하여 조회하기 위해 복합 인덱스를 설정합니다.
CREATE INDEX IF NOT EXISTS idx_recipe_reviews_recipe_created
  ON recipe_reviews (recipe_id, created_at DESC);


-- ============================================================================
-- 2. pattern_logs 보정 및 RLS/인덱스 설정
-- ============================================================================

-- 사용자의 아기 선택 탭 인덱스 로깅 컬럼이 없을 시 추가하여 다중 자녀 상태를 지원합니다.
ALTER TABLE public.pattern_logs
  ADD COLUMN IF NOT EXISTS child_index smallint NOT NULL DEFAULT 0;

-- 해당 컬럼이 어떤 용도인지 기록하기 위해 코멘트를 남깁니다.
COMMENT ON COLUMN public.pattern_logs.child_index IS '앱 PatternLogEntry.childIndex — 아이 탭 인덱스(0~4)';

-- 보안 강화를 위해 RLS 활성화
ALTER TABLE public.pattern_logs ENABLE ROW LEVEL SECURITY;

-- 정책: 패턴 로그 기록용으로 비인증 및 인증 사용자 전원에게 삽입 및 조회 권한을 전체 오픈합니다.
DROP POLICY IF EXISTS "pattern_logs_all_anon" ON public.pattern_logs;
CREATE POLICY "pattern_logs_all_anon"
  ON public.pattern_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 특정 아기 정보의 최근 로그 및 카테고리별 로그를 고속 검색하기 위해 최적화된 다중 컬럼 인덱스를 생성합니다.
CREATE INDEX IF NOT EXISTS idx_pattern_logs_user_child_at
  ON public.pattern_logs (user_email, child_index, at_ms DESC);

CREATE INDEX IF NOT EXISTS idx_pattern_logs_user_child_cat_at
  ON public.pattern_logs (user_email, child_index, category_id, at_ms DESC);


-- ============================================================================
-- 3. Storage 버킷 및 정책 설정
-- ============================================================================

-- 후기 이미지 업로드를 위해 'review-images' 버킷을 데이터가 없으면 신규 생성합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- 정책: 인증된 회원에 한해서만 리뷰 이미지를 업로드할 수 있도록 제한합니다.
DROP POLICY IF EXISTS "로그인 사용자 업로드 허용" ON storage.objects;
CREATE POLICY "로그인 사용자 업로드 허용" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images' AND auth.role() = 'authenticated'
  );

-- 정책: 누구나 후기 이미지를 퍼블릭 링크로 조회할 수 있도록 오픈합니다.
DROP POLICY IF EXISTS "누구나 이미지 조회 허용" ON storage.objects;
CREATE POLICY "누구나 이미지 조회 허용" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

-- 정책: 본인이 올린 이미지만 보관함에서 삭제할 수 있도록 보호합니다.
DROP POLICY IF EXISTS "본인 업로드 이미지 삭제 허용" ON storage.objects;
CREATE POLICY "본인 업로드 이미지 삭제 허용" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images' AND auth.uid() = owner
  );


-- ============================================================================
-- 4. review_comments (후기 게시글 댓글 테이블) 생성 및 보안/인덱스 설정
-- ============================================================================

-- 테이블 구조 갱신을 위해 기존 테이블을 삭제합니다.
DROP TABLE IF EXISTS review_comments CASCADE;

-- 댓글 및 대댓글 기능을 하나로 통합 처리하기 위해 parent_id를 추가하여 테이블을 구성합니다.
CREATE TABLE review_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY, -- 댓글 고유 ID
  review_id uuid REFERENCES recipe_reviews(id) ON DELETE CASCADE NOT NULL, -- 대상 후기 ID
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- 작성자 ID
  username text NOT NULL, -- 작성자 닉네임
  content text NOT NULL, -- 댓글 또는 답글 내용
  is_secret boolean DEFAULT false NOT NULL, -- 비밀 여부 체크
  parent_id uuid REFERENCES review_comments(id) ON DELETE CASCADE, -- 부모 댓글의 ID (대댓글 관계 형성, 일반댓글은 NULL)
  created_at timestamptz DEFAULT now() -- 등록 일시
);

-- RLS 보안 적용
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 댓글 목록을 자유롭게 조회하도록 설정합니다.
DROP POLICY IF EXISTS "누구나 댓글 조회" ON review_comments;
CREATE POLICY "누구나 댓글 조회" ON review_comments
  FOR SELECT USING (true);

-- 정책: 로그인한 인증 회원만 본인의 user_id 계정을 사용해 댓글을 작성하도록 제어합니다.
DROP POLICY IF EXISTS "로그인 사용자 댓글 작성" ON review_comments;
CREATE POLICY "로그인 사용자 댓글 작성" ON review_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 정책: 본인이 작성한 댓글에 한해서만 삭제가 가능하게 설정합니다.
DROP POLICY IF EXISTS "본인 댓글만 삭제" ON review_comments;
CREATE POLICY "본인 댓글만 삭제" ON review_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 정책: 본인이 작성한 댓글에 한해서만 내용을 수정할 수 있도록 허용합니다. (추후 수정 기능 대비용)
DROP POLICY IF EXISTS "본인 댓글만 수정" ON review_comments;
CREATE POLICY "본인 댓글만 수정" ON review_comments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 특정 후기글 기준 전체 댓글 리스트를 빠른 속도로 정렬 조회하기 위해 인덱스를 생성합니다.
CREATE INDEX IF NOT EXISTS idx_review_comments_review_created
  ON review_comments (review_id, created_at ASC);


-- ============================================================================
-- 5. 조회수(views) 증가를 위한 보안 정의 함수(RPC) 생성
-- ============================================================================

-- RLS 정책("본인 후기만 수정") 때문에 타인의 글 조회수를 직접 UPDATE할 수 없는 문제를 우회하기 위해
-- 관리자(SECURITY DEFINER) 권한으로 조회수를 안전하게 1 올리는 데이터베이스 함수를 생성합니다.
CREATE OR REPLACE FUNCTION increment_views(review_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE recipe_reviews
  SET views = COALESCE(views, 0) + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
