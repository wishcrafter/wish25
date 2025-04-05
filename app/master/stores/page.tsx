'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

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

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .order('store_id', { ascending: true });

        if (error) {
          throw error;
        }

        setStores(data || []);
      } catch (err: any) {
        console.error('Error fetching stores:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">점포 정보</h1>
        <div className="loading-state">
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1 className="page-title">점포 정보</h1>
        <div className="error-state">
          에러: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">점포 정보</h1>
      {stores.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {(Object.entries(columnMapping) as [keyof typeof columnMapping, string][]).map(([key, label]) => (
                  <th key={key}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stores.map((store, index) => (
                <tr key={index}>
                  {(Object.keys(columnMapping) as (keyof typeof columnMapping)[]).map((key) => (
                    <td key={key} className={columnStyles[key]}>
                      {key === 'opening_date' && store[key as keyof StoreData]
                        ? new Date(store[key as keyof StoreData] as string).toLocaleDateString('ko-KR')
                        : store[key as keyof StoreData] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          등록된 점포가 없습니다.
        </div>
      )}
    </div>
  );
} 