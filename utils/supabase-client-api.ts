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
  console.log(`[CLIENT-API] fetchData 호출: 테이블=${table}`, options);
  try {
    const result = await callSupabaseApi({
      action: 'select',
      table,
      data: options
    });
    console.log(`[CLIENT-API] fetchData 결과: 성공=${result.success}, 데이터 개수=${result.data?.length || 0}`);
    return result;
  } catch (error) {
    console.error(`[CLIENT-API] fetchData 오류(${table}):`, error);
    throw error;
  }
}

// 데이터 추가
export async function insertData(table: string, values: any) {
  console.log(`[CLIENT-API] insertData 호출: 테이블=${table}`, values);
  try {
    const result = await callSupabaseApi({
      action: 'insert',
      table,
      data: { values }
    });
    console.log(`[CLIENT-API] insertData 결과: 성공=${result.success}`);
    return result;
  } catch (error) {
    console.error(`[CLIENT-API] insertData 오류(${table}):`, error);
    throw error;
  }
}

// 데이터 수정
export async function updateData(table: string, match: any, values: any) {
  console.log(`[CLIENT-API] updateData 호출: 테이블=${table}`, { match, values });
  try {
    const result = await callSupabaseApi({
      action: 'update',
      table,
      data: { values, match }
    });
    console.log(`[CLIENT-API] updateData 결과: 성공=${result.success}`);
    return result;
  } catch (error) {
    console.error(`[CLIENT-API] updateData 오류(${table}):`, error);
    throw error;
  }
}

// 데이터 삭제
export async function deleteData(table: string, match: any) {
  console.log(`[CLIENT-API] deleteData 호출: 테이블=${table}`, match);
  try {
    const result = await callSupabaseApi({
      action: 'delete',
      table,
      data: { match }
    });
    console.log(`[CLIENT-API] deleteData 결과: 성공=${result.success}`);
    return result;
  } catch (error) {
    console.error(`[CLIENT-API] deleteData 오류(${table}):`, error);
    throw error;
  }
}

// API 호출 함수
async function callSupabaseApi(params: SupabaseApiParams) {
  console.log(`[CLIENT-API] API 요청: 액션=${params.action}, 테이블=${params.table}`);
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    const result = await response.json();
    console.log(`[CLIENT-API] API 응답: 상태=${response.status}, 성공=${result.success}`);
    
    if (!response.ok) {
      console.error(`[CLIENT-API] API 오류: ${result.message}`);
      throw new Error(result.message || '서버 오류가 발생했습니다.');
    }
    
    return result;
  } catch (error) {
    console.error('[CLIENT-API] API 호출 실패:', error);
    throw error;
  }
} 