import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase-server';

export async function POST(request: Request) {
  try {
    // API 호출 로그 추가
    console.log('[API/supabase] 요청 시작');
    
    const { action, table, data, filters } = await request.json();
    
    // Supabase 상태 확인 로그
    console.log('[API/supabase] 테이블:', table);
    console.log('[API/supabase] 액션:', action);
    
    // 승인된 테이블만 접근 허용
    const allowedTables = ['stores', 'vendors', 'w_customers', 'w_rooms', 'sales', 'others', 'expenses'];
    if (!allowedTables.includes(table)) {
      console.warn(`[API/supabase] 승인되지 않은 테이블 접근 시도: ${table}`);
      return NextResponse.json(
        { success: false, message: '승인되지 않은 테이블에 접근할 수 없습니다.' },
        { status: 403 }
      );
    }
    
    // 읽기 작업
    if (action === 'select') {
      console.log(`[API/supabase] SELECT 쿼리 실행: ${table}`);
      
      let query = supabase
        .from(table)
        .select(data.select || '*');
      
      // 정렬 처리
      if (data.orderBy) {
        query = query.order(data.orderBy, { ascending: data.ascending !== false });
      }
      
      // 추가 필터 적용
      if (data.filters) {
        // not 필터
        if (data.filters.not) {
          for (const [column, value] of Object.entries(data.filters.not)) {
            query = query.not(column, 'eq', value);
          }
        }
        
        // in 필터
        if (data.filters.in) {
          for (const [column, values] of Object.entries(data.filters.in)) {
            if (Array.isArray(values)) {
              query = query.in(column, values as any[]);
            }
          }
        }
        
        // neq 필터
        if (data.filters.neq) {
          for (const [column, value] of Object.entries(data.filters.neq)) {
            query = query.neq(column, value);
          }
        }
      }
      
      const { data: result, error } = await query;
      
      if (error) {
        console.error('[API/supabase] SELECT 쿼리 오류:', error);
        throw error;
      }
      
      console.log(`[API/supabase] SELECT 쿼리 결과: ${result ? result.length : 0}개 항목`);
      return NextResponse.json({ success: true, data: result });
    }
    
    // 쓰기 작업 (insert)
    if (action === 'insert') {
      console.log(`[API/supabase] INSERT 쿼리 실행: ${table}`);
      
      const { data: result, error } = await supabase
        .from(table)
        .insert(data.values)
        .select();
      
      if (error) {
        console.error('[API/supabase] INSERT 쿼리 오류:', error);
        throw error;
      }
      
      console.log('[API/supabase] INSERT 쿼리 성공');
      return NextResponse.json({ success: true, data: result });
    }
    
    // 수정 작업 (update)
    if (action === 'update') {
      console.log(`[API/supabase] UPDATE 쿼리 실행: ${table}`);
      
      const { data: result, error } = await supabase
        .from(table)
        .update(data.values)
        .match(data.match)
        .select();
      
      if (error) {
        console.error('[API/supabase] UPDATE 쿼리 오류:', error);
        throw error;
      }
      
      console.log('[API/supabase] UPDATE 쿼리 성공');
      return NextResponse.json({ success: true, data: result });
    }
    
    // 삭제 작업 (delete)
    if (action === 'delete') {
      console.log(`[API/supabase] DELETE 쿼리 실행: ${table}`);
      
      const { data: result, error } = await supabase
        .from(table)
        .delete()
        .match(data.match);
      
      if (error) {
        console.error('[API/supabase] DELETE 쿼리 오류:', error);
        throw error;
      }
      
      console.log('[API/supabase] DELETE 쿼리 성공');
      return NextResponse.json({ success: true });
    }
    
    console.warn(`[API/supabase] 지원되지 않는 작업: ${action}`);
    return NextResponse.json(
      { success: false, message: '지원되지 않는 작업입니다.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API/supabase] API 오류:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 