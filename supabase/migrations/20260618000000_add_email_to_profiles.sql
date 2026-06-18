-- =============================================
-- babyFoodProfiles 테이블에 email 컬럼 추가 마이그레이션
-- =============================================
-- 회원가입할 때 부모가 입력한 이메일 정보를 프로필 테이블에 함께 저장하고,
-- 나중에 '부모 이름 + 아기 이름'으로 가입한 이메일(아이디)을 조회할 수 있도록
-- babyFoodProfiles 테이블에 email 컬럼(text 타입)을 추가합니다.
alter table public."babyFoodProfiles" 
add column if not exists email text;
