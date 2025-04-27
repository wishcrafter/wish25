'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '../../../utils/supabase-client-api';

interface VendorData {
  id: number;
  store_id: number;
  category: string;
  order: number;
  vendor_name: string;
  bank_account: string;
  business_number: string;
}

interface StoreData {
  store_id: number;
  store_name: string;
}

const columnMapping: { [key: string]: string } = {
  store_id: '점포',
  category: '구분',
  vendor_name: '거래처명',
  bank_account: '계좌번호',
  business_number: '사업자번호'
};

const columnStyles: { [key: string]: string } = {
  store_id: 'col-name text-center',
  category: 'col-date text-center',
  vendor_name: 'col-name text-center',
  bank_account: 'col-account text-center',
  business_number: 'col-business-num text-center'
};

// 빈 데이터 샘플
const emptyVendorData: VendorData[] = [
  {
    id: 0,
    store_id: 0,
    category: '',
    order: 0,
    vendor_name: '',
    bank_account: '',
    business_number: ''
  }
];

export default function VendorsContent() {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendorsData() {
      try {
        setLoading(true);
        
        // 점포 데이터와 거래처 데이터를 병렬로 가져오기
        const [storesResponse, vendorsResponse] = await Promise.all([
          fetchData('stores', { 
            select: 'store_id, store_name',
            orderBy: 'store_id'
          }),
          fetchData('vendors', {
            orderBy: 'store_id'
          })
        ]);

        // 에러 처리
        if (!storesResponse.success) throw new Error('점포 데이터 로딩 실패');
        if (!vendorsResponse.success) throw new Error('거래처 데이터 로딩 실패');
        
        // 데이터 설정
        setStores(storesResponse.data || []);
        
        // 매입을 먼저, 나머지는 order로 정렬
        const sortedVendors = vendorsResponse.data ? vendorsResponse.data.sort((a: VendorData, b: VendorData) => {
          if (a.store_id !== b.store_id) {
            return a.store_id - b.store_id;
          }
          if (a.category === '매입' && b.category !== '매입') return -1;
          if (a.category !== '매입' && b.category === '매입') return 1;
          return a.order - b.order;
        }) : [];
        
        // 데이터가 있으면 설정, 없으면 빈 데이터 샘플 사용
        setVendors(sortedVendors.length > 0 ? sortedVendors : emptyVendorData);
      } catch (err: any) {
        console.error('거래처 데이터 로딩 오류:', err);
        setError(err.message);
        // 에러 발생시에도 빈 화면이 아닌 샘플 데이터 표시
        setVendors(emptyVendorData);
      } finally {
        setLoading(false);
      }
    }

    fetchVendorsData();
  }, []);

  // 점포 ID로 점포명 찾기
  const getStoreName = (storeId: number) => {
    const store = stores.find(s => s.store_id === storeId);
    return store ? store.store_name : '-';
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="minimal-loading-state">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {loading && vendors.length > 0 && (
        <div className="minimal-loading-indicator">
          <div className="loading-spinner-small"></div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {Object.entries(columnMapping).map(([key, label]) => (
                <th key={key}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.length > 0 ? (
              vendors.map((vendor, index) => (
                <tr key={index}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key} className={columnStyles[key]}>
                      {key === 'store_id' ? getStoreName(vendor.store_id) : vendor[key as keyof VendorData] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Object.keys(columnMapping).length} className="empty-state">
                  등록된 거래처가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .data-table-container {
          max-height: none !important;
          overflow: visible !important;
          overflow-y: visible !important;
        }
      `}</style>
    </>
  );
} 