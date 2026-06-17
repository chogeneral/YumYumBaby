import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 — 앱 전역에서 이 인스턴스를 공유해 불필요한 연결 생성을 방지
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
