/**
 * 클라이언트에서 Supabase 작업을 안전하게 처리하기 위한 유틸리티 함수
 * 이 함수들은 서버 API를 통해 Supabase 작업을 수행합니다.
 */

type SupabaseApiParams = {
  action: 'select' | 'insert' | 'update' | 'delete' | 'function';
  table?: string;
  data?: any;
  filters?: any;
  functionName?: string;
};

// 데이터 조회
export async function fetchData(table: string, options: any = {}) {
  try {
    const result = await callSupabaseApi({
      action: 'select',
      table,
      data: options
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// 데이터 추가
export async function insertData(table: string, values: any) {
  try {
    const result = await callSupabaseApi({
      action: 'insert',
      table,
      data: { values }
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// 데이터 수정
export async function updateData(table: string, match: any, values: any) {
  try {
    const result = await callSupabaseApi({
      action: 'update',
      table,
      data: { values, match }
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// 데이터 삭제
export async function deleteData(table: string, match: any) {
  try {
    const result = await callSupabaseApi({
      action: 'delete',
      table,
      data: { match }
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// RPC 함수 호출
export async function callCustomFunction(functionName: string, params: any = {}) {
  try {
    const result = await callSupabaseApi({
      action: 'function',
      functionName,
      data: params
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// API 호출 함수
async function callSupabaseApi(params: SupabaseApiParams) {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: params.action,
        table: params.table,
        data: params.data,
        functionName: params.functionName
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '서버 오류가 발생했습니다.');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
} 