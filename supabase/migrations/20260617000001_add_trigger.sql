-- =============================================
-- 트리거 제거 마이그레이션
-- =============================================
-- 기존에 사용하던 auth.users 트리거를 제거합니다.
-- 프로필 생성은 앱(App.jsx)에서 signUp 성공 후 직접 INSERT하는 방식으로 변경되었습니다.

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists "onAuthUserCreated" on auth.users;
drop function if exists public.handle_new_user();
