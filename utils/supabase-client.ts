import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('클라이언트 측에서는 직접 Supabase에 접근할 수 없습니다. 서버 API를 통해 작업합니다.')
};

// 더미 쿼리 객체 생성 (체이닝을 지원하는 모든 메서드 포함)
const createDummyQuery = (tableName: string) => {
  return {
    select: (fields?: string) => {
      return createDummyQuery(tableName);
    },
    insert: (values: any) => {
      return Promise.resolve(defaultErrorResponse);
    },
    update: (values: any) => {
      return Promise.resolve(defaultErrorResponse);
    },
    delete: () => {
      return Promise.resolve(defaultErrorResponse);
    },
    eq: (field: string, value: any) => {
      return createDummyQuery(tableName);
    },
    neq: (field: string, value: any) => {
      return createDummyQuery(tableName);
    },
    gt: (field: string, value: any) => {
      return createDummyQuery(tableName);
    },
    gte: (field: string, value: any) => {
      return createDummyQuery(tableName);
    },
    lt: (field: string, value: any) => {
      return createDummyQuery(tableName);
    },
    lte: (field: string, value: any) => {
      return createDummyQuery(tableName);
    },
    like: (field: string, value: any) => {
      return createDummyQuery(tableName);
    },
    not: (field: string, operator: string, value: any) => {
      return createDummyQuery(tableName);
    },
    in: (field: string, values: any[]) => {
      return createDummyQuery(tableName);
    },
    or: (query: string) => {
      return createDummyQuery(tableName);
    },
    order: (field: string, options?: any) => {
      return createDummyQuery(tableName);
    },
    limit: (count: number) => {
      return createDummyQuery(tableName);
    },
    range: (from: number, to: number) => {
      return createDummyQuery(tableName);
    },
    single: () => {
      return Promise.resolve(defaultErrorResponse);
    },
    maybeSingle: () => {
      return Promise.resolve(defaultErrorResponse);
    },
    then: (resolve: any) => {
      return Promise.resolve(defaultErrorResponse).then(resolve);
    }
  };
};

// 더미 Supabase 객체 생성
const createDummyClient = (): SupabaseClient => {
  return {
    from: (tableName: string) => {
      return createDummyQuery(tableName);
    },
    auth: {
      signIn: () => {
        return Promise.resolve({ 
          user: null, 
          session: null, 
          error: new Error('클라이언트 측에서는 직접 Supabase에 접근할 수 없습니다.') 
        });
      },
      signOut: () => {
        return Promise.resolve({ error: null });
      },
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    rpc: (fn: string, params?: any) => {
      return Promise.resolve(defaultErrorResponse);
    },
  } as unknown as SupabaseClient;
};

// 항상 더미 클라이언트 반환 (클라이언트에서 직접 Supabase에 연결하지 않음)
const supabaseClient = createDummyClient();

// 클라이언트만 내보내기
export { supabaseClient }; 