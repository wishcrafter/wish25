'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import PageLayout from '@/components/PageLayout';

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

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 점포 데이터와 거래처 데이터를 병렬로 가져오기
        const [storesResult, vendorsResult] = await Promise.all([
          supabase.from('stores').select('store_id, store_name'),
          supabase.from('vendors').select('*')
        ]);

        // 에러 처리
        if (storesResult.error) throw storesResult.error;
        if (vendorsResult.error) throw vendorsResult.error;
        
        // 데이터 설정
        setStores(storesResult.data || []);
        
        // 매입을 먼저, 나머지는 order로 정렬
        const sortedVendors = vendorsResult.data ? vendorsResult.data.sort((a, b) => {
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
        console.error('Error fetching data:', err);
        setError(err.message);
        // 에러 발생시에도 빈 화면이 아닌 샘플 데이터 표시
        setVendors(emptyVendorData);
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

  return (
    <PageLayout
      title="거래처 정보"
      isLoading={false}
      error={error}
    >
      <div className="data-table-container" style={{ maxHeight: 'none', overflow: 'visible' }}>
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
            {vendors.map((vendor, index) => (
              <tr key={index}>
                {(Object.keys(columnMapping) as (keyof typeof columnMapping)[]).map((key) => (
                  <td key={key} className={columnStyles[key]}>
                    {key === 'store_id' ? getStoreName(vendor.store_id) : vendor[key as keyof VendorData] || '-'}
                  </td>
                ))}
              </tr>
            ))}
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
    </PageLayout>
  );
}