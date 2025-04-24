'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface SalesData {
  sales_id: number;
  store_name: string;
  sales_date: string;
  total_amount: number;
  card_amount: number;
  cash_amount: number;
  etc_amount: number;
}

interface RawSalesData {
  store_id: number;
  sales_date: string;
  total_amount: number;
  card_amount: number;
  cash_amount: number;
  etc_amount: number;
  stores: {
    store_name: string;
  };
}

interface Store {
  store_id: number;
  store_name: string;
}

interface StoreSummary {
  total: number;
  card: number;
  cash: number;
  etc: number;
  transactions: number;
}

const columnMapping = {
  store_name: '점포명',
  sales_date: '매출일자',
  total_amount: '총매출',
  card_amount: '카드',
  cash_amount: '현금',
  etc_amount: '기타'
} as const;

const columnStyles = {
  store_name: 'col-name text-center min-w-[100px] max-w-[120px]',
  sales_date: 'col-date text-center min-w-[100px] max-w-[120px]',
  total_amount: 'col-number text-right min-w-[100px] max-w-[120px]',
  card_amount: 'col-number text-right min-w-[100px] max-w-[120px]',
  cash_amount: 'col-number text-right min-w-[100px] max-w-[120px]',
  etc_amount: 'col-number text-right min-w-[80px] max-w-[100px]'
} as const;

export default function SalesContent() {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [availableStores, setAvailableStores] = useState<Store[]>([]);
  const [allStoresSelected, setAllStoresSelected] = useState(true);
  const [filteredSalesByDate, setFilteredSalesByDate] = useState<SalesData[]>([]);
  const [filteredSales, setFilteredSales] = useState<SalesData[]>([]);

  // 연도 옵션 생성 (현재 연도 기준 이전 5년)
  const years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  // 월 옵션 생성
  const months = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  // 모든 데이터를 한 번에 가져오는 함수
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [storesPromise, salesPromise] = [
        supabase
          .from('stores')
          .select('store_id, store_name')
          .not('store_name', 'eq', '위시크래프터')
          .order('store_id'),
        
        supabase
          .from('sales')
          .select(`
            store_id,
            sales_date,
            total_amount,
            card_amount,
            cash_amount,
            etc_amount,
            transaction_count,
            updated_at,
            stores (store_name)
          `)
          .order('sales_date', { ascending: false })
      ];
      
      // 두 요청을 병렬로 실행
      const [storesResult, salesResult] = await Promise.all([storesPromise, salesPromise]);
      
      // 오류 처리
      if (storesResult.error) throw storesResult.error;
      if (salesResult.error) throw salesResult.error;
      
      // 데이터 처리
      const filteredStores = (storesResult.data || []).filter(store => store.store_id !== 1100 && store.store_id !== 2001);
      setAvailableStores(filteredStores);
      setSelectedStores(new Set(filteredStores.map(store => store.store_name)));
      
      const formattedData: SalesData[] = (salesResult.data as unknown as RawSalesData[]).map(item => ({
        sales_id: item.store_id,
        store_name: item.stores.store_name,
        sales_date: item.sales_date,
        total_amount: item.total_amount,
        card_amount: item.card_amount,
        cash_amount: item.cash_amount,
        etc_amount: item.etc_amount,
      }));
      
      setSales(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchAllData();
  }, []);

  // 년도나 월이 변경되면 필터링된 데이터 다시 계산
  useEffect(() => {
    if (!sales.length) return;
    
    // 해당 연월에 맞는 데이터 필터링
    const salesByDate = sales.filter(sale => {
      // 2001 점포 제외
      if (sale.sales_id === 2001) return false;
      
      const saleDate = new Date(sale.sales_date);
      const saleYear = saleDate.getFullYear().toString();
      const saleMonth = (saleDate.getMonth() + 1).toString().padStart(2, '0');
      
      return saleYear === selectedYear && saleMonth === selectedMonth;
    });
    
    setFilteredSalesByDate(salesByDate);
    
    // 선택된 점포까지 적용하여 필터링
    const salesByStores = salesByDate.filter(sale => 
      selectedStores.has(sale.store_name)
    );
    
    setFilteredSales(salesByStores);
  }, [sales, selectedYear, selectedMonth, selectedStores]);

  // 점포 전체 선택/해제 토글
  const toggleAllStores = () => {
    if (allStoresSelected) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(availableStores.map(store => store.store_name)));
    }
    setAllStoresSelected(!allStoresSelected);
  };

  // 개별 점포 토글
  const toggleStore = (storeName: string) => {
    const newSelectedStores = new Set(selectedStores);
    if (newSelectedStores.has(storeName)) {
      newSelectedStores.delete(storeName);
    } else {
      newSelectedStores.add(storeName);
    }
    setSelectedStores(newSelectedStores);
    setAllStoresSelected(newSelectedStores.size === availableStores.length);
  };

  // 금액을 한국어 형식으로 포맷팅하는 함수
  const formatAmount = (amount: number | null) => {
    if (amount === null || typeof amount !== 'number') return '0';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 함수
  const formatDate = (dateString: string) => {
    return dateString.split('T')[0];
  };

  const formatCellValue = (sale: SalesData, key: keyof SalesData) => {
    if (key === 'sales_date') {
      return formatDate(sale[key]);
    }
    if (['total_amount', 'card_amount', 'cash_amount', 'etc_amount'].includes(key)) {
      return formatAmount(sale[key] as number) + '원';
    }
    return sale[key]?.toString() || '-';
  };

  const calculateStoreTotal = (storeName: string): StoreSummary => {
    const storeData = filteredSalesByDate.filter(sale => sale.store_name === storeName);
    return {
      total: storeData.reduce((sum, sale) => sum + sale.total_amount, 0),
      card: storeData.reduce((sum, sale) => sum + sale.card_amount, 0),
      cash: storeData.reduce((sum, sale) => sum + sale.cash_amount, 0),
      etc: storeData.reduce((sum, sale) => sum + sale.etc_amount, 0),
      transactions: storeData.length
    };
  };

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="sales-content">
        <div className="error-state">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="sales-content">
      <div className="date-filters">
        <div className="select-wrapper">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-select"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
        </div>
        <div className="select-wrapper">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-select"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </select>
        </div>
      </div>

      <div className="store-summary">
        <h2 className="summary-title">점포별 매출현황</h2>
        <div className="summary-grid">
          {availableStores.map(store => {
            const storeTotal = calculateStoreTotal(store.store_name);
            
            return (
              <div key={store.store_id} className="store-total-card">
                <div className="store-name">{store.store_name}</div>
                <div className="store-details">
                  <div className="amount-row">
                    <span className="amount-label">총매출</span>
                    <span className="amount-value">{formatAmount(storeTotal.total)}원</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">카드</span>
                    <span className="amount-value">{formatAmount(storeTotal.card)}원</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">현금</span>
                    <span className="amount-value">{formatAmount(storeTotal.cash)}원</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">기타</span>
                    <span className="amount-value">{formatAmount(storeTotal.etc)}원</span>
                  </div>
                  <div className="amount-row transactions">
                    <span className="amount-label">거래건수</span>
                    <span className="amount-value">{storeTotal.transactions}건</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="store-filters">
        <div className="store-toggle-all">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={allStoresSelected}
              onChange={toggleAllStores}
            />
            <span className="checkmark"></span>
            <span className="label-text">전체 선택</span>
          </label>
        </div>
        <div className="store-toggles">
          {availableStores.map(store => (
            <label key={store.store_name} className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={selectedStores.has(store.store_name)}
                onChange={() => toggleStore(store.store_name)}
              />
              <span className="checkmark"></span>
              <span className="label-text">{store.store_name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {Object.entries(columnMapping).map(([key, label]) => (
                <th key={key} className={columnStyles[key as keyof typeof columnStyles]}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(columnMapping).length} className="empty-state">
                  등록된 매출 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={`${sale.sales_id}-${sale.sales_date}`}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key} className={columnStyles[key as keyof typeof columnStyles]}>
                      {formatCellValue(sale, key as keyof SalesData)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 