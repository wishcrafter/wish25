import { createClient } from '@supabase/supabase-js';

// 주의: 이 파일은 서버 측에서만 가져와야 합니다!
// 서버 측 환경 변수는 NEXT_PUBLIC_ 접두사를 사용하지 않습니다
const supabaseUrl = process.env.SUPABASE_URL || '';
// Vercel에 설정된 값 또는 로컬 환경변수 사용
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 상세 로깅 추가
console.log('[서버] Supabase 서버 설정 정보:');
console.log('[서버] URL 존재 여부:', !!supabaseUrl);
console.log('[서버] SERVICE_KEY 존재 여부:', !!supabaseServiceKey); 
console.log('[서버] URL 확인 (앞 20자):', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : '없음');
console.log('[서버] 환경:', process.env.NODE_ENV);

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[서버] SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 환경 변수가 설정되지 않았습니다.');
}

// 서버 측에서만 사용하는 Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}); 