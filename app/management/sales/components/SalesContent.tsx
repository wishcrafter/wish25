'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface SalesData {
  store_id: number;
  sales_date: string;
  total_amount: number | null;
  card_amount: number | null;
  cash_amount: number | null;
  etc_amount: number | null;
  transaction_count: number | null;
  updated_at: string;
  store_name: string;
}

interface RawSalesData {
  store_id: number;
  sales_date: string;
  total_amount: number | null;
  card_amount: number | null;
  cash_amount: number | null;
  etc_amount: number | null;
  transaction_count: number | null;
  updated_at: string;
  stores: {
    store_name: string;
  };
}

const columnMapping = {
  store_name: '점포명',
  sales_date: '매출일자',
  total_amount: '총매출',
  card_amount: '카드',
  cash_amount: '현금',
  etc_amount: '기타',
  transaction_count: '거래건수'
} as const;

const columnStyles = {
  store_name: 'col-name min-w-[100px] max-w-[150px]',
  sales_date: 'col-date text-center min-w-[100px] max-w-[120px]',
  total_amount: 'col-number text-right min-w-[100px] max-w-[120px]',
  card_amount: 'col-number text-right min-w-[100px] max-w-[120px]',
  cash_amount: 'col-number text-right min-w-[100px] max-w-[120px]',
  etc_amount: 'col-number text-right min-w-[80px] max-w-[100px]',
  transaction_count: 'col-number text-right min-w-[80px] max-w-[100px]'
} as const;

export default function SalesContent() {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [availableStores, setAvailableStores] = useState<string[]>([]);
  const [allStoresSelected, setAllStoresSelected] = useState(true);

  // 연도 옵션 생성 (현재 연도 기준 이전 5년)
  const years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  // 월 옵션 생성
  const months = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  // 점포 목록을 가져오는 함수
  const fetchStores = async () => {
    try {
      const { data: stores, error } = await supabase
        .from('stores')
        .select('store_id, store_name')
        .not('store_name', 'eq', '위시크래프터')
        .order('store_id');

      if (error) throw error;

      const storeNames = stores.map(store => store.store_name);
      setAvailableStores(storeNames);
      setSelectedStores(new Set(storeNames));
    } catch (err: any) {
      console.error('Error fetching stores:', err);
      setError(err.message);
    }
  };

  // 매출 데이터를 가져오는 함수
  const fetchSales = async () => {
    try {
      setLoading(true);
      
      const { data: rawData, error } = await supabase
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
        .order('sales_date', { ascending: false });

      if (error) throw error;

      const formattedData: SalesData[] = (rawData as unknown as RawSalesData[]).map(item => ({
        store_id: item.store_id,
        sales_date: item.sales_date,
        total_amount: item.total_amount,
        card_amount: item.card_amount,
        cash_amount: item.cash_amount,
        etc_amount: item.etc_amount,
        transaction_count: item.transaction_count,
        updated_at: item.updated_at,
        store_name: item.stores.store_name
      }));

      setSales(formattedData);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 점포 목록과 매출 데이터를 동시에 가져옴
    Promise.all([fetchStores(), fetchSales()]);
  }, []);

  // 필터링된 데이터 계산
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.sales_date);
    const saleYear = saleDate.getFullYear().toString();
    const saleMonth = (saleDate.getMonth() + 1).toString().padStart(2, '0');
    
    return (
      saleYear === selectedYear &&
      saleMonth === selectedMonth &&
      selectedStores.has(sale.store_name)
    );
  });

  // 점포 전체 선택/해제 토글
  const toggleAllStores = () => {
    if (allStoresSelected) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(availableStores));
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

  // 특정 키의 값을 가져오는 함수
  const getValue = (sale: SalesData, key: keyof typeof columnMapping): string => {
    if (key === 'sales_date') {
      return formatDate(sale[key]);
    }
    if (['total_amount', 'card_amount', 'cash_amount', 'etc_amount'].includes(key)) {
      return formatAmount(sale[key] as number | null);
    }
    if (key === 'transaction_count') {
      return sale[key]?.toString() || '0';
    }
    return sale[key]?.toString() || '-';
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">매출 관리</h1>
        <div className="loading-state">
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1 className="page-title">매출 관리</h1>
        <div className="error-state">
          에러: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">매출 관리</h1>
      <div className="filters-container">
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
      </div>

      <div className="store-summary">
        <h2 className="summary-title">점포별 총매출</h2>
        <div className="summary-grid">
          {availableStores
            .map(store => {
              const storeData = sales
                .filter(sale => {
                  const saleDate = new Date(sale.sales_date);
                  const saleYear = saleDate.getFullYear().toString();
                  const saleMonth = (saleDate.getMonth() + 1).toString().padStart(2, '0');
                  return (
                    sale.store_name === store &&
                    saleYear === selectedYear &&
                    saleMonth === selectedMonth
                  );
                })
                .reduce((acc, sale) => ({
                  total: acc.total + (sale.total_amount || 0),
                  card: acc.card + (sale.card_amount || 0),
                  cash: acc.cash + (sale.cash_amount || 0),
                  etc: acc.etc + (sale.etc_amount || 0),
                  transactions: acc.transactions + (sale.transaction_count || 0)
                }), {
                  total: 0,
                  card: 0,
                  cash: 0,
                  etc: 0,
                  transactions: 0
                });
              
              return (
                <div key={store} className="store-total-card">
                  <div className="store-name">{store}</div>
                  <div className="store-details">
                    <div className="amount-row">
                      <span className="amount-label">총매출</span>
                      <span className="amount-value">{formatAmount(storeData.total)}원</span>
                    </div>
                    <div className="amount-row">
                      <span className="amount-label">카드</span>
                      <span className="amount-value">{formatAmount(storeData.card)}원</span>
                    </div>
                    <div className="amount-row">
                      <span className="amount-label">현금</span>
                      <span className="amount-value">{formatAmount(storeData.cash)}원</span>
                    </div>
                    <div className="amount-row">
                      <span className="amount-label">기타</span>
                      <span className="amount-value">{formatAmount(storeData.etc)}원</span>
                    </div>
                    <div className="amount-row transactions">
                      <span className="amount-label">거래건수</span>
                      <span className="amount-value">{storeData.transactions}건</span>
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
            <label key={store} className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={selectedStores.has(store)}
                onChange={() => toggleStore(store)}
              />
              <span className="checkmark"></span>
              <span className="label-text">{store}</span>
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
                <tr key={`${sale.store_id}-${sale.sales_date}`}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key} className={columnStyles[key as keyof typeof columnStyles]}>
                      {getValue(sale, key as keyof typeof columnMapping)}
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