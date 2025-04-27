/**
 * 클라이언트에서 서버 API를 호출하여 안전하게 데이터를 처리하는 유틸리티
 * 민감한 키를 노출하지 않고 서버 측에서 작업 수행
 */

// 데이터 선택 쿼리
export async function fetchData(table: string, options: {
  columns?: string;
  filters?: Array<{column: string; operator: string; value: any}>;
  order?: {column: string; ascending: boolean};
}) {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        query: {
          type: 'select',
          ...options
        }
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '데이터를 가져오는 중 오류가 발생했습니다');
    }
    
    return result.data;
  } catch (error: any) {
    console.error(`${table} 데이터 로딩 오류:`, error.message);
    throw error;
  }
}

// 데이터 삽입 쿼리
export async function insertData(table: string, data: any) {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        query: {
          type: 'insert',
          data
        }
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '데이터를 추가하는 중 오류가 발생했습니다');
    }
    
    return result.data;
  } catch (error: any) {
    console.error(`${table} 데이터 추가 오류:`, error.message);
    throw error;
  }
}

// 데이터 업데이트 쿼리
export async function updateData(table: string, data: any, match: {column: string; value: any}) {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        query: {
          type: 'update',
          data,
          match
        }
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '데이터를 수정하는 중 오류가 발생했습니다');
    }
    
    return result.data;
  } catch (error: any) {
    console.error(`${table} 데이터 수정 오류:`, error.message);
    throw error;
  }
}

// 데이터 삭제 쿼리
export async function deleteData(table: string, match: {column: string; value: any}) {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        query: {
          type: 'delete',
          match
        }
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '데이터를 삭제하는 중 오류가 발생했습니다');
    }
    
    return result.data;
  } catch (error: any) {
    console.error(`${table} 데이터 삭제 오류:`, error.message);
    throw error;
  }
} 