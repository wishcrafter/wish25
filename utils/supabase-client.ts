import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('클라이언트 측에서는 직접 Supabase에 접근할 수 없습니다. 서버 API를 통해 작업합니다.')
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

// 더미 Supabase 객체 생성
const createDummyClient = (): SupabaseClient => {
  return {
    from: () => createDummyQuery(),
    auth: {
      signIn: () => Promise.resolve({ user: null, session: null, error: new Error('클라이언트 측에서는 직접 Supabase에 접근할 수 없습니다.') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    rpc: () => Promise.resolve(defaultErrorResponse),
  } as unknown as SupabaseClient;
};

// 항상 더미 클라이언트 반환 (클라이언트에서 직접 Supabase에 연결하지 않음)
const supabaseClient = createDummyClient();

// 클라이언트만 내보내기
export { supabaseClient }; 