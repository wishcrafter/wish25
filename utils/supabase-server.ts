import { createClient } from '@supabase/supabase-js';

// 주의: 이 파일은 서버 측에서만 가져와야 합니다!
// 서버 측 환경 변수는 NEXT_PUBLIC_ 접두사를 사용하지 않습니다
const supabaseUrl = process.env.SUPABASE_URL || '';
// Vercel에 설정된 값 또는 로컬 환경변수 사용
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 사용 가능한 모든 환경 변수 이름 확인 (실제 값은 출력하지 않음)
const supabaseEnvVars = Object.keys(process.env).filter(key => 
  key.includes('SUPABASE') || key.includes('supabase')
);

if (!supabaseUrl || !supabaseServiceKey) {
  // 모든 console.log, console.error, console.warn, console.info 코드 삭제
}

// 서버 측에서만 사용하는 Supabase 클라이언트 생성
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('필수 환경 변수가 누락되었습니다.');
    }
    
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    return client;
  } catch (error) {
    // 모든 console.log, console.error, console.warn, console.info 코드 삭제
    
    // 더미 클라이언트 반환
    return {
      from: (table: string) => {
        return {
          select: () => {
            return Promise.resolve({ data: null, error: new Error('Supabase 서버 클라이언트 초기화 실패') });
          }
        };
      }
    } as any;
  }
};

export const supabase = createSupabaseClient(); 