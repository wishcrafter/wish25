import { createClient } from '@supabase/supabase-js';

// 공개 Anon Key만 클라이언트에서 사용
// 민감한 작업은 서버 API를 통해 수행해야 합니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// 읽기 전용 작업만 허용하도록 권장
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey); 