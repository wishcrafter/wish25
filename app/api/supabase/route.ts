import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabase-server';

export async function POST(request: Request) {
  try {
    const { action, table, data, filters } = await request.json();
    
    // 승인된 테이블만 접근 허용
    const allowedTables = ['stores', 'vendors', 'w_customers', 'w_rooms'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json(
        { success: false, message: '승인되지 않은 테이블에 접근할 수 없습니다.' },
        { status: 403 }
      );
    }
    
    // 읽기 작업
    if (action === 'select') {
      const { data: result, error } = await supabaseServer
        .from(table)
        .select(data.select || '*')
        .order(data.orderBy || 'id', { ascending: data.ascending !== false });
      
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    }
    
    // 쓰기 작업 (insert)
    if (action === 'insert') {
      const { data: result, error } = await supabaseServer
        .from(table)
        .insert(data.values)
        .select();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    }
    
    // 수정 작업 (update)
    if (action === 'update') {
      const { data: result, error } = await supabaseServer
        .from(table)
        .update(data.values)
        .match(data.match)
        .select();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    }
    
    // 삭제 작업 (delete)
    if (action === 'delete') {
      const { data: result, error } = await supabaseServer
        .from(table)
        .delete()
        .match(data.match);
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, message: '지원되지 않는 작업입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Supabase API error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 