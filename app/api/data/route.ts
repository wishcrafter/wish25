import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase-server';
import { SupabaseClient } from '@supabase/supabase-js';

// 안전하게 서버에서 데이터를 가져오는 API 라우트
export async function POST(request: NextRequest) {
  try {
    const { table, query } = await request.json();
    
    // 테이블 이름 유효성 검사 (보안 강화)
    const validTables = ['stores', 'vendors', 'purchases', 'sales', 'expenses', 'others', 'wstudio', 'wcustomers'];
    if (!validTables.includes(table)) {
      return NextResponse.json(
        { error: '유효하지 않은 테이블 접근 시도' },
        { status: 400 }
      );
    }
    
    // 쿼리 타입에 따라 적절한 데이터베이스 쿼리 실행
    let result;
    
    switch (query.type) {
      case 'select': {
        const { columns, filters, order } = query;
        result = await executeSelectQuery(table, columns, filters, order);
        break;
      }
        
      case 'insert': {
        const { data } = query;
        result = await supabase.from(table).insert(data);
        break;
      }
        
      case 'update': {
        const { data: updateData, match } = query;
        result = await executeUpdateQuery(table, updateData, match);
        break;
      }
        
      case 'delete': {
        const { match: deleteMatch } = query;
        result = await executeDeleteQuery(table, deleteMatch);
        break;
      }
        
      default:
        return NextResponse.json(
          { error: '지원되지 않는 쿼리 타입' },
          { status: 400 }
        );
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return NextResponse.json({ data: result.data });
  } catch (error: any) {
    console.error('서버 API 오류:', error.message);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 개별 함수로 분리하여 타입 문제 해결
async function executeSelectQuery(
  table: string, 
  columns?: string, 
  filters?: Array<{column: string; operator: string; value: any}>,
  order?: {column: string; ascending: boolean}
) {
  let query = supabase.from(table).select(columns || '*');
  
  // 필터 적용
  if (filters && Array.isArray(filters)) {
    for (const filter of filters) {
      const { column, operator, value } = filter;
      
      if (operator === 'eq') {
        query = query.eq(column, value);
      } else if (operator === 'neq') {
        query = query.neq(column, value);
      } else if (operator === 'gt') {
        query = query.gt(column, value);
      } else if (operator === 'lt') {
        query = query.lt(column, value);
      } else if (operator === 'not') {
        query = query.not(column, 'eq', value);
      } else if (operator === 'or' && Array.isArray(value)) {
        const orConditions = value.map(val => `${column}.eq.${val}`).join(',');
        query = query.or(orConditions);
      }
    }
  }
  
  // 정렬 적용
  if (order) {
    query = query.order(order.column, { ascending: order.ascending });
  }
  
  return await query;
}

// 업데이트 쿼리 실행 함수
async function executeUpdateQuery(
  table: string,
  updateData: any,
  match?: {column: string; value: any}
) {
  const query = supabase.from(table).update(updateData);
  
  if (match && typeof match.column === 'string' && match.value !== undefined) {
    return await query.eq(match.column, match.value);
  }
  
  return await query;
}

// 삭제 쿼리 실행 함수
async function executeDeleteQuery(
  table: string,
  match?: {column: string; value: any}
) {
  const query = supabase.from(table).delete();
  
  if (match && typeof match.column === 'string' && match.value !== undefined) {
    return await query.eq(match.column, match.value);
  }
  
  return await query;
} 