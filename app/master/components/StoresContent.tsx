'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '../../../utils/supabase-client-api';

// stores 테이블의 데이터 타입 정의
interface StoreData {
  store_id: number;
  store_name: string;
  business_number: string;
  bank_account: string;
  opening_date: string;
  address: string;
  extra_info?: string;
}

// 컬럼명 한글 매핑
const columnMapping: { [key: string]: string } = {
  store_id: '점포번호',
  store_name: '점포명',
  business_number: '사업자번호',
  bank_account: '계좌번호',
  opening_date: '개점일',
  address: '주소',
  extra_info: '비고',
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

export default function StoresContent() {
  const [storesData, setStoresData] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStoresData() {
      try {
        // 이미 데이터가 있는 경우 로딩 표시 안함
        if (storesData.length === 0) {
          setLoading(true);
        }
        
        const response = await fetchData('stores', {
          orderBy: 'store_id',
          ascending: true
        });

        if (!response.success) {
          throw new Error('점포 데이터 로딩 실패');
        }

        setStoresData(response.data?.length > 0 ? response.data : emptyStoreData);
      } catch (err: any) {
        console.error('점포 데이터 조회 중 에러:', err);
        setError(err.message);
        setStoresData(emptyStoreData);
      } finally {
        setLoading(false);
      }
    }

    fetchStoresData();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading && storesData.length === 0) {
    return (
      <div className="minimal-loading-state">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {loading && storesData.length > 0 && (
        <div className="minimal-loading-indicator">
          <div className="loading-spinner-small"></div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {Object.entries(columnMapping).map(([key, label]) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {storesData.length > 0 ? (
              storesData.map((store) => (
                <tr key={store.store_id}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key}>
                      {key === 'opening_date' 
                        ? formatDate(store[key as keyof StoreData] as string)
                        : store[key as keyof StoreData] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Object.keys(columnMapping).length} className="empty-state">
                  등록된 점포가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
} 