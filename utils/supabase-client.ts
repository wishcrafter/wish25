import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 공개 Anon Key만 클라이언트에서 사용
// 민감한 작업은 서버 API를 통해 수행해야 합니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 개발 환경에서 환경 변수가 없을 경우 경고
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.');
}

// 클라이언트 사이드에서만 Supabase 클라이언트 생성
let supabaseClient: SupabaseClient;

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('Supabase client not initialized')
};

// 더미 쿼리 객체 생성 (체이닝을 지원하는 모든 메서드 포함)
const createDummyQuery = () => {
  const dummyQuery = {
    select: () => dummyQuery,
    insert: () => Promise.resolve(defaultErrorResponse),
    update: () => Promise.resolve(defaultErrorResponse),
    delete: () => Promise.resolve(defaultErrorResponse),
    eq: () => dummyQuery,
    neq: () => dummyQuery,
    gt: () => dummyQuery,
    gte: () => dummyQuery,
    lt: () => dummyQuery,
    lte: () => dummyQuery,
    like: () => dummyQuery,
    not: () => dummyQuery,
    in: () => dummyQuery,
    or: () => dummyQuery,
    order: () => dummyQuery,
    limit: () => dummyQuery,
    range: () => dummyQuery,
    single: () => Promise.resolve(defaultErrorResponse),
    maybeSingle: () => Promise.resolve(defaultErrorResponse),
    then: (resolve: any) => Promise.resolve(defaultErrorResponse).then(resolve)
  };
  return dummyQuery;
};

// 환경 변수가 설정된 경우에만 클라이언트 생성
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // 서버 사이드 또는 환경 변수가 없는 경우 더미 객체 제공
  supabaseClient = {
    from: () => createDummyQuery(),
    auth: {
      signIn: () => Promise.resolve({ user: null, session: null, error: new Error('Supabase client not initialized') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    rpc: () => Promise.resolve(defaultErrorResponse),
  } as unknown as SupabaseClient;
}

// 읽기 전용 작업만 허용하도록 권장
export { supabaseClient }; 