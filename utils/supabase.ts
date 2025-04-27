import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseClient } from './supabase-client';

// Supabase 프로젝트 URL과 서비스 키가 필요합니다.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// 개발 환경에서 환경 변수가 없을 경우 경고
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_URL 또는 SUPABASE_SERVICE_KEY 환경 변수가 설정되지 않았습니다.');
}

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('Server Supabase client not initialized')
};

// 실제 서버측 클라이언트 또는 더미 객체 생성
let supabase: SupabaseClient;

if (supabaseUrl && supabaseServiceKey) {
  // 서버 측에서만 사용하는 클라이언트
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  // 더미 객체 제공
  supabase = {
    from: () => ({
      select: () => Promise.resolve(defaultErrorResponse),
      insert: () => Promise.resolve(defaultErrorResponse),
      update: () => Promise.resolve(defaultErrorResponse),
      delete: () => Promise.resolve(defaultErrorResponse),
      eq: () => ({
        select: () => Promise.resolve(defaultErrorResponse),
        update: () => Promise.resolve(defaultErrorResponse),
        delete: () => Promise.resolve(defaultErrorResponse),
      }),
      order: () => ({
        select: () => Promise.resolve(defaultErrorResponse),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ user: null, error: new Error('Server Supabase client not initialized') }),
    },
    rpc: () => Promise.resolve(defaultErrorResponse),
  } as unknown as SupabaseClient;
}

export { supabase, supabaseClient }; 