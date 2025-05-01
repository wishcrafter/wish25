import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 URL과 서비스 키가 필요합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('Server Supabase client not initialized')
};

// 실제 서버측 클라이언트 또는 더미 객체 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 