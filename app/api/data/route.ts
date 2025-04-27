import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase-server';
import { SupabaseClient } from '@supabase/supabase-js';

// 안전하게 서버에서 데이터를 가져오는 API 라우트
export async function POST(request: NextRequest) {
  try {
    console.log('[API/data] 요청 시작');
    
    const body = await request.json();
    const { action } = body;
    console.log('[API/data] 액션:', action);

    // 테이블 생성 요청 처리
    if (action === 'create_table') {
      const { tableName } = body;
      console.log('[API/data] 테이블 생성 요청:', tableName);
      
      // 승인된 테이블 이름만 허용
      const allowedTables = ['w_customers', 'w_rooms', 'stores', 'vendors'];
      if (!allowedTables.includes(tableName)) {
        console.warn(`[API/data] 승인되지 않은 테이블 생성 시도: ${tableName}`);
        return NextResponse.json(
          { success: false, message: '승인되지 않은 테이블에 접근할 수 없습니다.' },
          { status: 403 }
        );
      }

      // CREATE TABLE SQL 실행
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          room_no INTEGER,
          name VARCHAR(50) NOT NULL,
          deposit INTEGER DEFAULT 0,
          monthly_fee INTEGER DEFAULT 0,
          first_fee INTEGER DEFAULT 0,
          move_in_date DATE,
          move_out_date DATE,
          status VARCHAR(10) DEFAULT '입실',
          memo TEXT,
          resident_id VARCHAR(20),
          phone VARCHAR(20),
          phone_sub VARCHAR(20),
          address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      console.log('[API/data] SQL 실행 시도:', createTableSQL.substring(0, 100) + '...');

      // Supabase RPC를 통한 SQL 쿼리 실행
      const { data, error: execError } = await supabase.rpc('exec_sql', {
        sql_query: createTableSQL
      });

      if (execError) {
        console.error('[API/data] 테이블 생성 오류:', execError);
        return NextResponse.json(
          { success: false, message: execError.message },
          { status: 500 }
        );
      }

      console.log('[API/data] 테이블 생성 성공:', tableName);
      return NextResponse.json({ success: true, data });
    }

    // 다른 작업 처리
    const { table, query } = body;
    console.log('[API/data] 테이블:', table, '쿼리 타입:', query?.type);
    
    // 테이블 이름 유효성 검사 (보안 강화)
    const validTables = ['stores', 'vendors', 'purchases', 'sales', 'expenses', 'others', 'wstudio', 'wcustomers'];
    if (!validTables.includes(table)) {
      console.warn(`[API/data] 유효하지 않은 테이블 접근 시도: ${table}`);
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
        console.log('[API/data] SELECT 쿼리 실행');
        result = await executeSelectQuery(table, columns, filters, order);
        break;
      }
        
      case 'insert': {
        const { data } = query;
        console.log('[API/data] INSERT 쿼리 실행');
        result = await supabase.from(table).insert(data);
        break;
      }
        
      case 'update': {
        const { data: updateData, match } = query;
        console.log('[API/data] UPDATE 쿼리 실행');
        result = await executeUpdateQuery(table, updateData, match);
        break;
      }
        
      case 'delete': {
        const { match: deleteMatch } = query;
        console.log('[API/data] DELETE 쿼리 실행');
        result = await executeDeleteQuery(table, deleteMatch);
        break;
      }
        
      default:
        console.warn(`[API/data] 지원되지 않는 쿼리 타입: ${query?.type}`);
        return NextResponse.json(
          { error: '지원되지 않는 쿼리 타입' },
          { status: 400 }
        );
    }
    
    if (result.error) {
      console.error('[API/data] 쿼리 오류:', result.error);
      throw result.error;
    }
    
    console.log('[API/data] 쿼리 성공');
    return NextResponse.json({ data: result.data });
  } catch (error: any) {
    console.error('[API/data] API 오류:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
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