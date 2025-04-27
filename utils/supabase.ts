import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseClient } from './supabase-client';

// Supabase 프로젝트 URL과 서비스 키가 필요합니다.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// 개발 환경에서 환경 변수가 없을 경우 경고
if (!supabaseUrl || !supabaseServiceKey) {
  // 모든 console.log, console.error, console.warn, console.info 코드 삭제
} else {
  // 모든 console.log, console.error, console.warn, console.info 코드 삭제
}

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('Server Supabase client not initialized')
};

// 실제 서버측 클라이언트 또는 더미 객체 생성
let supabase: SupabaseClient;

if (supabaseUrl && supabaseServiceKey) {
  // 모든 console.log, console.error, console.warn, console.info 코드 삭제
  // 서버 측에서만 사용하는 클라이언트
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  // 모든 console.log, console.error, console.warn, console.info 코드 삭제
  // 더미 객체 제공
  supabase = {
    from: (tableName: string) => {
      // 모든 console.log, console.error, console.warn, console.info 코드 삭제
      return {
        select: (fields?: string) => {
          // 모든 console.log, console.error, console.warn, console.info 코드 삭제
          return Promise.resolve(defaultErrorResponse);
        },
        insert: (values: any) => {
          // 모든 console.log, console.error, console.warn, console.info 코드 삭제
          return Promise.resolve(defaultErrorResponse);
        },
        update: (values: any) => {
          // 모든 console.log, console.error, console.warn, console.info 코드 삭제
          return Promise.resolve(defaultErrorResponse);
        },
        delete: () => {
          // 모든 console.log, console.error, console.warn, console.info 코드 삭제
          return Promise.resolve(defaultErrorResponse);
        },
        eq: () => ({
          select: () => Promise.resolve(defaultErrorResponse),
          update: () => Promise.resolve(defaultErrorResponse),
          delete: () => Promise.resolve(defaultErrorResponse),
        }),
        order: () => ({
          select: () => Promise.resolve(defaultErrorResponse),
        }),
      };
    },
    auth: {
      getUser: () => {
        // 모든 console.log, console.error, console.warn, console.info 코드 삭제
        return Promise.resolve({ user: null, error: new Error('Server Supabase client not initialized') });
      },
    },
    rpc: () => {
      // 모든 console.log, console.error, console.warn, console.info 코드 삭제
      return Promise.resolve(defaultErrorResponse);
    },
  } as unknown as SupabaseClient;
}

// 모든 console.log, console.error, console.warn, console.info 코드 삭제
console.log('[SERVER-SUPABASE] 모듈 초기화 완료');
export { supabase, supabaseClient }; 