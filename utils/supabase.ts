import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 URL과 anon key가 필요합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 환경변수에 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 