/**
 * 클라이언트에서 Supabase 작업을 안전하게 처리하기 위한 유틸리티 함수
 * 이 함수들은 서버 API를 통해 Supabase 작업을 수행합니다.
 */

type SupabaseApiParams = {
  action: 'select' | 'insert' | 'update' | 'delete';
  table: string;
  data?: any;
  filters?: any;
};

// 데이터 조회
export async function fetchData(table: string, options: any = {}) {
  return callSupabaseApi({
    action: 'select',
    table,
    data: options
  });
}

// 데이터 추가
export async function insertData(table: string, values: any) {
  return callSupabaseApi({
    action: 'insert',
    table,
    data: { values }
  });
}

// 데이터 수정
export async function updateData(table: string, values: any, match: any) {
  return callSupabaseApi({
    action: 'update',
    table,
    data: { values, match }
  });
}

// 데이터 삭제
export async function deleteData(table: string, match: any) {
  return callSupabaseApi({
    action: 'delete',
    table,
    data: { match }
  });
}

// API 호출 함수
async function callSupabaseApi(params: SupabaseApiParams) {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '서버 오류가 발생했습니다.');
    }
    
    return result;
  } catch (error) {
    console.error('Supabase API 호출 오류:', error);
    throw error;
  }
} 