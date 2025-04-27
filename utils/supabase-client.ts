import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 클라이언트 측 환경 변수 가져오기 (보안을 위해 NEXT_PUBLIC_ 접두사 필요)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('클라이언트 초기화 실패, 서버 API를 통해 작업합니다. 인터넷 연결을 확인하고 페이지를 새로고침하세요.')
};

// 개발 환경에서 환경 변수가 없을 경우 경고
if (typeof window !== 'undefined') {
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.');
  }
  if (!supabaseAnonKey) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.');
  }
}

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

// 클라이언트 사이드에서만 Supabase 클라이언트 생성
let supabaseClient: SupabaseClient;

// 환경 변수 유효성 검사
const hasValidEnvVars = () => {
  return typeof window !== 'undefined' && !!supabaseUrl && !!supabaseAnonKey;
};

// 더미 Supabase 객체 생성
const createDummyClient = (): SupabaseClient => {
  return {
    from: () => createDummyQuery(),
    auth: {
      signIn: () => Promise.resolve({ user: null, session: null, error: new Error('환경 변수가 설정되지 않았습니다') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    rpc: () => Promise.resolve(defaultErrorResponse),
  } as unknown as SupabaseClient;
};

// 클라이언트 초기화 함수
const createSupabaseClientOrDummy = (): SupabaseClient => {
  // 환경 변수가 있고 클라이언트 사이드인 경우만 실제 클라이언트 생성
  if (hasValidEnvVars()) {
    try {
      console.log('Supabase 클라이언트 초기화 시도...');
      // 브라우저 콘솔에서 확인할 수 있도록 URL 일부 출력 (전체 URL은 보안상 위험)
      console.log('URL 확인:', supabaseUrl.substring(0, 20) + '...');
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Supabase 클라이언트 초기화 실패:', error);
      return createDummyClient();
    }
  }
  
  // 환경 변수가 없거나 서버 사이드인 경우 더미 객체 제공
  return createDummyClient();
};

// Supabase 클라이언트 초기화
supabaseClient = createSupabaseClientOrDummy();

// 클라이언트만 내보내기
export { supabaseClient }; 