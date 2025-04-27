import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase-server';

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
      case 'select':
        const { columns, filters, order } = query;
        
        let dbQuery = supabase.from(table).select(columns || '*');
        
        // 필터 적용
        if (filters && Array.isArray(filters)) {
          filters.forEach(filter => {
            const { column, operator, value } = filter;
            
            if (operator === 'eq') {
              dbQuery = dbQuery.eq(column, value);
            } else if (operator === 'neq') {
              dbQuery = dbQuery.neq(column, value);
            } else if (operator === 'gt') {
              dbQuery = dbQuery.gt(column, value);
            } else if (operator === 'lt') {
              dbQuery = dbQuery.lt(column, value);
            } else if (operator === 'not') {
              dbQuery = dbQuery.not(column, operator === 'eq' ? 'eq' : 'eq', value);
            } else if (operator === 'or') {
              // or 연산은 복잡한 논리가 필요할 수 있어 별도 처리 필요
              const orConditions = value.map((val: any) => `${column}.eq.${val}`).join(',');
              dbQuery = dbQuery.or(orConditions);
            }
          });
        }
        
        // 정렬 적용
        if (order) {
          const { column, ascending } = order;
          dbQuery = dbQuery.order(column, { ascending });
        }
        
        result = await dbQuery;
        break;
        
      case 'insert':
        const { data } = query;
        result = await supabase.from(table).insert(data);
        break;
        
      case 'update':
        const { data: updateData, match } = query;
        let updateQuery = supabase.from(table).update(updateData);
        
        // 매치 조건 적용
        if (match) {
          const { column, value } = match;
          updateQuery = updateQuery.eq(column, value);
        }
        
        result = await updateQuery;
        break;
        
      case 'delete':
        const { match: deleteMatch } = query;
        let deleteQuery = supabase.from(table).delete();
        
        // 매치 조건 적용
        if (deleteMatch) {
          const { column, value } = deleteMatch;
          deleteQuery = deleteQuery.eq(column, value);
        }
        
        result = await deleteQuery;
        break;
        
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