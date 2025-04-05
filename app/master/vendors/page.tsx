'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

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
  store_id: '점포명',
  category: '구분',
  vendor_name: '거래처명',
  bank_account: '계좌번호',
  business_number: '사업자번호'
};

const columnStyles: { [key: string]: string } = {
  store_id: 'col-name',
  category: 'col-name',
  vendor_name: 'col-name',
  bank_account: 'col-number',
  business_number: 'col-number'
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 점포 데이터 먼저 가져오기
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('store_id, store_name');

        if (storesError) throw storesError;
        setStores(storesData || []);

        // 거래처 데이터 가져오기
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('vendors')
          .select('*')
          .then(result => {
            const data = (result.data || []) as VendorData[];
            
            // 정렬 로직 적용
            return {
              ...result,
              data: data.sort((a, b) => {
                // 1순위: store_id
                if (a.store_id !== b.store_id) {
                  return a.store_id - b.store_id;
                }
                
                // 2순위: 매입 카테고리 우선
                if (a.category !== b.category) {
                  if (a.category === '매입') return -1;
                  if (b.category === '매입') return 1;
                }
                
                // 3순위: order 오름차순
                return a.order - b.order;
              })
            };
          });

        if (vendorsError) throw vendorsError;
        setVendors(vendorsData || []);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 점포 ID로 점포명 찾기
  const getStoreName = (storeId: number) => {
    const store = stores.find(s => s.store_id === storeId);
    return store ? store.store_name : '-';
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">거래처 정보</h1>
        <div className="loading-state">
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1 className="page-title">거래처 정보</h1>
        <div className="error-state">
          에러: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">거래처 정보</h1>
      
      {vendors.length > 0 ? (
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
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key} className={columnStyles[key]}>
                      {key === 'store_id' ? getStoreName(vendor.store_id) : vendor[key as keyof VendorData] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          등록된 거래처가 없습니다.
        </div>
      )}
    </div>
  );
}