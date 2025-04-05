'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

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

  if (loading) {
    return <div className="main">
      <div className="message message-info">데이터를 불러오는 중...</div>
    </div>;
  }

  if (error) {
    return <div className="main">
      <div className="message message-error">에러 발생: {error}</div>
    </div>;
  }

  return (
    <div className="main">
      <div className="page-header">
        <h1>점포 관리</h1>
      </div>

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
    </div>
  );
} 