'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '../../../utils/supabase-client-api';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import PageLayout from '@/app/components/PageLayout';
import DataTable from '@/app/components/DataTable';

interface StoreData {
  store_id: number;
  store_name: string;
  business_number: string;
  bank_account: string;
  opening_date: string;
  address: string;
  extra_info?: string;
}

const columnMapping: { [key: string]: string } = {
  store_name: '점포명',
  business_number: '사업자번호',
  bank_account: '계좌번호',
  address: '주소',
  opening_date: '개업일',
  extra_info: '비고'
};

// 컬럼별 스타일 매핑
const columnStyles: { [key: string]: string } = {
  store_name: 'col-name',
  business_number: 'col-business-num',
  bank_account: 'col-number',
  address: '',
  opening_date: 'col-date',
  extra_info: ''
};

// 빈 데이터 샘플
const emptyStoreData: StoreData[] = [
  {
    store_id: 0,
    store_name: '',
    business_number: '',
    bank_account: '',
    opening_date: '',
    address: '',
    extra_info: ''
  }
];

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        
        console.log('[STORES] 점포 데이터 로딩 시작');
        
        // 서버 API를 통해 점포 데이터 조회
        const response = await fetchData('stores', {
          orderBy: 'store_id',
          ascending: true
        });

        console.log('[STORES] 점포 데이터 응답:', { 
          success: response.success, 
          count: response.data?.length || 0 
        });

        if (!response.success) {
          throw new Error('점포 데이터 조회 실패');
        }

        // 데이터가 있으면 설정하고, 없으면 빈 배열 대신 빈 데이터 샘플 사용
        setStores(response.data && response.data.length > 0 ? response.data : emptyStoreData);
      } catch (err: any) {
        console.error('[STORES] 점포 데이터 로딩 오류:', err);
        setError(err.message);
        // 에러 발생시에도 빈 화면이 아닌 샘플 데이터 표시
        setStores(emptyStoreData);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  // 날짜 포맷터
  const formatters = {
    opening_date: (value: string) => 
      value ? new Date(value).toLocaleDateString('ko-KR') : '-'
  };

  return (
    <PageLayout 
      title="점포 정보"
      isLoading={false}
      error={error}
    >
      <DataTable 
        data={stores}
        columnMapping={columnMapping}
        columnStyles={columnStyles}
        formatters={formatters}
        emptyMessage=""
      />
    </PageLayout>
  );
} 