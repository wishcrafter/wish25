'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import PageLayout from '@/components/PageLayout';

// stores 테이블의 데이터 타입 정의
interface StoreData {
  store_id: number;  // id를 store_id로 수정
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
  // 실제 컬럼에 맞게 추가해주세요
};

export default function StoresPage() {
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
        
        const { data, error } = await supabase
          .from('stores')
          .select('*');

        if (error) {
          throw error;
        }

        setStoresData(data || []);
      } catch (err: any) {
        console.error('점포 데이터 조회 중 에러:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStoresData();
  }, []);

  return (
    <PageLayout
      title="점포 관리"
      isLoading={loading && storesData.length === 0}
      error={error}
    >
      {loading && storesData.length > 0 && (
        <div className="minimal-loading-indicator">
          <div className="loading-spinner-small"></div>
        </div>
      )}

      <div className="data-table">
        {storesData.length > 0 ? (
          <table>
            <thead>
              <tr>
                {/* 컬럼 헤더를 한글로 표시 */}
                {Object.keys(columnMapping).map((key) => (
                  <th key={key}>{columnMapping[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storesData.map((row) => (
                <tr key={row.store_id}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key}>
                      {key === 'opening_date' && row[key]
                        ? new Date(row[key]).toLocaleDateString('ko-KR')
                        : row[key as keyof StoreData]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="message message-info">등록된 점포가 없습니다.</div>
        )}
      </div>
    </PageLayout>
  );
} 