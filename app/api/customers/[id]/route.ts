import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const updatedData = await request.json();

    const { data, error } = await supabase
      .from('w_customers')
      .update(updatedData)
      .eq('id', customerId)
      .select()
      .single();

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