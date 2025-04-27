import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 더미 메서드용 기본 응답
const defaultErrorResponse = {
  data: null,
  error: new Error('클라이언트 측에서는 직접 Supabase에 접근할 수 없습니다. 서버 API를 통해 작업합니다.')
};

// 더미 쿼리 객체 생성 (체이닝을 지원하는 모든 메서드 포함)
const createDummyQuery = (tableName: string) => {
  console.log(`[DUMMY-CLIENT] 테이블 접근 시도: ${tableName}`);
  
  const dummyQuery = {
    select: (fields?: string) => {
      console.log(`[DUMMY-CLIENT] select 호출: 테이블=${tableName}, 필드=${fields || '*'}`);
      return dummyQuery;
    },
    insert: (values: any) => {
      console.log(`[DUMMY-CLIENT] insert 호출: 테이블=${tableName}`, values);
      return Promise.resolve(defaultErrorResponse);
    },
    update: (values: any) => {
      console.log(`[DUMMY-CLIENT] update 호출: 테이블=${tableName}`, values);
      return Promise.resolve(defaultErrorResponse);
    },
    delete: () => {
      console.log(`[DUMMY-CLIENT] delete 호출: 테이블=${tableName}`);
      return Promise.resolve(defaultErrorResponse);
    },
    eq: (field: string, value: any) => {
      console.log(`[DUMMY-CLIENT] eq 호출: 테이블=${tableName}, 필드=${field}, 값=${value}`);
      return dummyQuery;
    },
    neq: (field: string, value: any) => {
      console.log(`[DUMMY-CLIENT] neq 호출: 테이블=${tableName}, 필드=${field}, 값=${value}`);
      return dummyQuery;
    },
    gt: (field: string, value: any) => {
      console.log(`[DUMMY-CLIENT] gt 호출: 테이블=${tableName}, 필드=${field}, 값=${value}`);
      return dummyQuery;
    },
    gte: (field: string, value: any) => {
      console.log(`[DUMMY-CLIENT] gte 호출: 테이블=${tableName}, 필드=${field}, 값=${value}`);
      return dummyQuery;
    },
    lt: (field: string, value: any) => {
      console.log(`[DUMMY-CLIENT] lt 호출: 테이블=${tableName}, 필드=${field}, 값=${value}`);
      return dummyQuery;
    },
    lte: (field: string, value: any) => {
      console.log(`[DUMMY-CLIENT] lte 호출: 테이블=${tableName}, 필드=${field}, 값=${value}`);
      return dummyQuery;
    },
    like: (field: string, value: any) => {
      console.log(`[DUMMY-CLIENT] like 호출: 테이블=${tableName}, 필드=${field}, 값=${value}`);
      return dummyQuery;
    },
    not: (field: string, operator: string, value: any) => {
      console.log(`[DUMMY-CLIENT] not 호출: 테이블=${tableName}, 필드=${field}, 연산자=${operator}, 값=${value}`);
      return dummyQuery;
    },
    in: (field: string, values: any[]) => {
      console.log(`[DUMMY-CLIENT] in 호출: 테이블=${tableName}, 필드=${field}, 값 개수=${values.length}`);
      return dummyQuery;
    },
    or: (query: string) => {
      console.log(`[DUMMY-CLIENT] or 호출: 테이블=${tableName}, 쿼리=${query}`);
      return dummyQuery;
    },
    order: (field: string, options?: any) => {
      console.log(`[DUMMY-CLIENT] order 호출: 테이블=${tableName}, 필드=${field}`, options);
      return dummyQuery;
    },
    limit: (count: number) => {
      console.log(`[DUMMY-CLIENT] limit 호출: 테이블=${tableName}, 개수=${count}`);
      return dummyQuery;
    },
    range: (from: number, to: number) => {
      console.log(`[DUMMY-CLIENT] range 호출: 테이블=${tableName}, 범위=${from} ~ ${to}`);
      return dummyQuery;
    },
    single: () => {
      console.log(`[DUMMY-CLIENT] single 호출: 테이블=${tableName}`);
      return Promise.resolve(defaultErrorResponse);
    },
    maybeSingle: () => {
      console.log(`[DUMMY-CLIENT] maybeSingle 호출: 테이블=${tableName}`);
      return Promise.resolve(defaultErrorResponse);
    },
    then: (resolve: any) => {
      console.log(`[DUMMY-CLIENT] then 호출: 테이블=${tableName} (Promise 실행)`);
      return Promise.resolve(defaultErrorResponse).then(resolve);
    }
  };
  return dummyQuery;
};

// 더미 Supabase 객체 생성
const createDummyClient = (): SupabaseClient => {
  console.log('[DUMMY-CLIENT] 더미 Supabase 클라이언트 생성');
  
  return {
    from: (tableName: string) => {
      console.log(`[DUMMY-CLIENT] from 호출: 테이블=${tableName}`);
      return createDummyQuery(tableName);
    },
    auth: {
      signIn: () => {
        console.log('[DUMMY-CLIENT] auth.signIn 호출');
        return Promise.resolve({ 
          user: null, 
          session: null, 
          error: new Error('클라이언트 측에서는 직접 Supabase에 접근할 수 없습니다.') 
        });
      },
      signOut: () => {
        console.log('[DUMMY-CLIENT] auth.signOut 호출');
        return Promise.resolve({ error: null });
      },
      onAuthStateChange: () => {
        console.log('[DUMMY-CLIENT] auth.onAuthStateChange 호출');
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    rpc: (fn: string, params?: any) => {
      console.log(`[DUMMY-CLIENT] rpc 호출: 함수=${fn}`, params);
      return Promise.resolve(defaultErrorResponse);
    },
  } as unknown as SupabaseClient;
};

// 항상 더미 클라이언트 반환 (클라이언트에서 직접 Supabase에 연결하지 않음)
const supabaseClient = createDummyClient();

// 클라이언트만 내보내기
export { supabaseClient }; 