import { createClient } from '@supabase/supabase-js';

// 주의: 이 파일은 서버 측에서만 가져와야 합니다!
// 서버 측 환경 변수는 NEXT_PUBLIC_ 접두사를 사용하지 않습니다
const supabaseUrl = process.env.SUPABASE_URL || '';
// Vercel에 설정된 값 또는 로컬 환경변수 사용
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 상세 로깅 추가
console.log('[SERVER-CLIENT] Supabase 서버 설정 정보:');
console.log('[SERVER-CLIENT] URL 존재 여부:', !!supabaseUrl);
console.log('[SERVER-CLIENT] SERVICE_KEY 존재 여부:', !!supabaseServiceKey); 
console.log('[SERVER-CLIENT] URL 확인 (앞 20자):', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : '없음');
console.log('[SERVER-CLIENT] 환경:', process.env.NODE_ENV);

// 사용 가능한 모든 환경 변수 이름 확인 (실제 값은 출력하지 않음)
const supabaseEnvVars = Object.keys(process.env).filter(key => 
  key.includes('SUPABASE') || key.includes('supabase')
);
console.log('[SERVER-CLIENT] 사용 가능한 Supabase 관련 환경 변수 이름:', supabaseEnvVars);

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[SERVER-CLIENT] SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 환경 변수가 설정되지 않았습니다.');
}

// 서버 측에서만 사용하는 Supabase 클라이언트 생성
const createSupabaseClient = () => {
  try {
    console.log('[SERVER-CLIENT] Supabase 서버 클라이언트 생성 시도...');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('필수 환경 변수가 누락되었습니다.');
    }
    
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('[SERVER-CLIENT] Supabase 서버 클라이언트 생성 성공');
    return client;
  } catch (error) {
    console.error('[SERVER-CLIENT] Supabase 서버 클라이언트 생성 실패:', error);
    
    // 더미 클라이언트 반환
    console.warn('[SERVER-CLIENT] 더미 클라이언트로 대체합니다.');
    return {
      from: (table: string) => {
        console.warn(`[SERVER-CLIENT] 더미 호출 (테이블: ${table})`);
        return {
          select: () => {
            console.warn(`[SERVER-CLIENT] 더미 select (테이블: ${table})`);
            return Promise.resolve({ data: null, error: new Error('Supabase 서버 클라이언트 초기화 실패') });
          }
        };
      }
    } as any;
  }
};

export const supabase = createSupabaseClient(); 