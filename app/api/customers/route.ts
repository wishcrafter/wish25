import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('w_customers')
      .select('*')
      .order('room_no', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 