import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseClient } from './supabase-client';

// Supabase 프로젝트 URL과 서비스 키가 필요합니다.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// 개발 환경에서 환경 변수가 없을 경우 경고
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[SERVER-SUPABASE] SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 환경 변수가 설정되지 않았습니다.');
} else {
  console.log('[SERVER-SUPABASE] Supabase 환경 변수 확인: URL 및 서비스 키 설정됨');
}

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('Server Supabase client not initialized')
};

// 실제 서버측 클라이언트 또는 더미 객체 생성
let supabase: SupabaseClient;

if (supabaseUrl && supabaseServiceKey) {
  console.log('[SERVER-SUPABASE] 실제 Supabase 서버 클라이언트 생성');
  // 서버 측에서만 사용하는 클라이언트
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('[SERVER-SUPABASE] 환경 변수 없음: 더미 서버 클라이언트 생성');
  // 더미 객체 제공
  supabase = {
    from: (tableName: string) => {
      console.warn(`[SERVER-SUPABASE] 더미 호출: 테이블=${tableName}`);
      return {
        select: (fields?: string) => {
          console.warn(`[SERVER-SUPABASE] 더미 select: 테이블=${tableName}, 필드=${fields || '*'}`);
          return Promise.resolve(defaultErrorResponse);
        },
        insert: (values: any) => {
          console.warn(`[SERVER-SUPABASE] 더미 insert: 테이블=${tableName}`);
          return Promise.resolve(defaultErrorResponse);
        },
        update: (values: any) => {
          console.warn(`[SERVER-SUPABASE] 더미 update: 테이블=${tableName}`);
          return Promise.resolve(defaultErrorResponse);
        },
        delete: () => {
          console.warn(`[SERVER-SUPABASE] 더미 delete: 테이블=${tableName}`);
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
        console.warn('[SERVER-SUPABASE] 더미 auth.getUser 호출');
        return Promise.resolve({ user: null, error: new Error('Server Supabase client not initialized') });
      },
    },
    rpc: () => {
      console.warn('[SERVER-SUPABASE] 더미 rpc 호출');
      return Promise.resolve(defaultErrorResponse);
    },
  } as unknown as SupabaseClient;
}

console.log('[SERVER-SUPABASE] 모듈 초기화 완료');
export { supabase, supabaseClient }; 