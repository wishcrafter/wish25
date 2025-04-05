'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { StoreData, ColumnMapping } from '@/types';
import { formatDate } from '@/utils/format';
import { DataTable } from '@/components/DataTable';
import { PageContainer } from '@/components/PageContainer';

const columnMapping: ColumnMapping = {
  store_name: '점포명',
  business_number: '사업자번호',
  address: '주소',
  phone_number: '전화번호',
  opening_date: '개업일',
  memo: '메모'
};

export default function StoresPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">점포 정보</h1>
    </div>
  );
} 