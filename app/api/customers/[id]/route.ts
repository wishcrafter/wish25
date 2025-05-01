import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id);
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