'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchData } from '../../../utils/supabase-client-api';
import MonthRangeSlider from './MonthRangeSlider';

interface SummaryData {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalOthers: number;
  monthlyPurchases: number[];
  monthlySales: number[];
}

interface Store {
  store_id: number;
  store_name: string;
}

interface StoreData {
  store_id: number;
  store_name: string;
  sales: number;
  purchases: number;
  expenses: number;
  others: number;
  profit: number;
  vendorExpenses: Array<{vendor: string, amount: number}>;
}

interface Vendor {
  id: number;
  vendor_name: string;
  category: string;
}

// WStudio 데이터 인터페이스 추가
interface WStudioData {
  id: number;
  date: string;
  time: string;
  desc: string;
  amount_out: number;
  amount_in: number;
  balance: number;
  memo: string;
  branch: string;
  updated_at: string | null;
  room: number | null;
  real_month: number | null;
  real_sales: number | null;
}

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  // 범위 슬라이더 상태 (최소값, 최대값)
  const [periodRange, setPeriodRange] = useState<[number, number]>([1, new Date().getMonth() + 1]);
  
  // 마지막으로 불러온 데이터의 정보
  const [lastFetchedYear, setLastFetchedYear] = useState<string>('');
  
  const [stores, setStores] = useState<Store[]>([]);
  const [storesData, setStoresData] = useState<StoreData[]>([]);
  const [allData, setAllData] = useState<{
    sales: any[];
    purchases: any[];
    expenses: any[];
    others: any[];
    wstudio: WStudioData[]; // WStudio 데이터 필드 추가
  }>({
    sales: [],
    purchases: [],
    expenses: [],
    others: [],
    wstudio: [] // 초기값 설정
  });
  
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalOthers: 0,
    monthlyPurchases: Array(12).fill(0),
    monthlySales: Array(12).fill(0)
  });

  // 연도 옵션 생성 (현재 연도 기준 이전 5년)
  const years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  // 첫 로드 시 자동으로 불러오기 위한 상태
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 선택된 월 범위에 포함되는지 확인하는 함수
  const isMonthInRange = (month: number) => {
    const [start, end] = periodRange;
    return month >= start && month <= end;
  };

  const sliderRef = useRef<HTMLDivElement>(null);

  // 데이터 처리 함수 (이미 가져온 데이터를 기반으로 계산)
  const processData = () => {
    // 데이터가 없을 경우 처리하지 않음
    if (!allData.sales?.length && !allData.purchases?.length) {
      return;
    }
    
    const [startMonth, endMonth] = periodRange;
    const yearNum = parseInt(selectedYear);
    const monthsInRange = Array.from(
      {length: endMonth - startMonth + 1}, 
      (_, i) => startMonth + i
    );
    
    // 월별 데이터 초기화
    const monthlySales = Array(12).fill(0);
    const monthlyPurchases = Array(12).fill(0);
    
    // 점포별 데이터 맵 초기화
    const storeDataMap: { [key: number]: StoreData } = {};
    stores.forEach(store => {
      storeDataMap[store.store_id] = {
        store_id: store.store_id,
        store_name: store.store_name,
        sales: 0,
        purchases: 0,
        expenses: 0,
        others: 0,
        profit: 0,
        vendorExpenses: []
      };
    });

    // 각 데이터 유형별로 한 번씩만 반복
    // 1. 매출 데이터 처리
    let totalSales = 0;
    allData.sales.forEach(item => {
      const date = new Date(item.sales_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const amount = item.total_amount || 0;
      
      // 2001 점포는 여기서 처리하지 않음 (wstudio 데이터에서 처리)
      if (item.store_id === 2001) {
        return;
      }
      
      // 월별 데이터 누적 (연도에 관계없이)
      if (year === yearNum) {
        monthlySales[month - 1] += amount;
      }
      
      // 기간 범위에 포함되는 데이터만 합산
      if (year === yearNum && month >= startMonth && month <= endMonth) {
        totalSales += amount;
        
        // 점포별 데이터 누적
        if (storeDataMap[item.store_id]) {
          storeDataMap[item.store_id].sales += amount;
        }
      }
    });
    
    // 2001 점포(더아름)의 매출 데이터만 wstudio 테이블에서 가져오기
    if (storeDataMap[2001]) {
      let wstudioTotalSales = 0;
      
      allData.wstudio.forEach(item => {
        if (!item.date) return;
        
        const date = new Date(item.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // real_sales 값이 있으면 해당 값 사용, 없으면 amount_in 사용
        const amount = (item.real_sales !== null) ? item.real_sales : item.amount_in || 0;
        
        if (year === yearNum && month >= startMonth && month <= endMonth) {
          wstudioTotalSales += amount;
          
          // 월별 데이터 누적
          if (year === yearNum) {
            monthlySales[month - 1] += amount;
          }
        }
      });
      
      // 2001 점포의 매출 데이터 설정
      storeDataMap[2001].sales = wstudioTotalSales;
      
      // 전체 매출에 2001 점포 매출 추가
      totalSales += wstudioTotalSales;
    }
    
    // 2. 매입 데이터 처리
    let totalPurchases = 0;
    allData.purchases.forEach(item => {
      const date = new Date(item.purchase_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const amount = item.amount || 0;
      
      // 월별 데이터 누적
      if (year === yearNum) {
        monthlyPurchases[month - 1] += amount;
      }
      
      // 기간 범위에 포함되는 데이터만 합산
      if (year === yearNum && month >= startMonth && month <= endMonth) {
        totalPurchases += amount;
        
        // 점포별 데이터 누적
        if (storeDataMap[item.store_id]) {
          storeDataMap[item.store_id].purchases += amount;
        }
      }
    });
    
    // 3. 고정비용 데이터 처리
    let totalExpenses = 0;
    allData.expenses.forEach(item => {
      if (item.year === yearNum && monthsInRange.includes(item.month)) {
        const amount = item.amount || 0;
        totalExpenses += amount;
        
        // 점포별 데이터 누적
        if (storeDataMap[item.store_id]) {
          storeDataMap[item.store_id].expenses += amount;
          
          // 거래처별 비용 항목 추가
          if (item.vendors && storeDataMap[item.store_id].vendorExpenses) {
            const vendorName = item.vendors.vendor_name || '기타';
            
            // 기존 거래처 항목이 있는지 확인
            const existingVendor = storeDataMap[item.store_id].vendorExpenses.find(
              v => v.vendor === vendorName
            );
            
            if (existingVendor) {
              existingVendor.amount += amount;
            } else {
              storeDataMap[item.store_id].vendorExpenses.push({
                vendor: vendorName,
                amount: amount
              });
            }
          }
        }
      }
    });
    
    // 4. 기타거래 데이터 처리
    let totalOthers = 0;
    allData.others.forEach(item => {
      if (item.date) {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        if (year === yearNum && month >= startMonth && month <= endMonth) {
          const amount = item.amount || 0;
          totalOthers += amount;
          
          // 점포별 데이터 누적
          if (storeDataMap[item.store_id]) {
            storeDataMap[item.store_id].others += amount;
          }
        }
      }
    });
    
    // 이익 계산
    Object.values(storeDataMap).forEach(store => {
      store.profit = store.sales - store.purchases - store.expenses - store.others;
    });
    
    // 데이터 정렬하여 저장
    const sortedStoreData = Object.values(storeDataMap).sort((a, b) => a.store_id - b.store_id);
    
    // 요약 데이터 업데이트
    setSummaryData({
      totalSales,
      totalPurchases,
      totalExpenses,
      totalOthers,
      monthlySales,
      monthlyPurchases
    });
    
    // 점포별 데이터 업데이트
    setStoresData(sortedStoreData);
  };

  // 데이터 가져오기
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    
    // 최대 3번 재시도 로직 추가
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log('[DASHBOARD] 대시보드 데이터 로딩 시작');
        
        // 모든 데이터를 병렬로 가져오기
        const [
          storesResponse, 
          salesResponse, 
          purchasesResponse, 
          expensesResponse, 
          othersResponse, 
          wstudioResponse
        ] = await Promise.all([
          fetchData('stores', { orderBy: 'store_id' }),
          fetchData('sales', {}),
          fetchData('purchases', {}),
          fetchData('expenses', { 
            select: `
              *,
              vendors (
                id,
                vendor_name,
                category
              )
            `,
            filters: {
              eq: { 'year': parseInt(selectedYear) }
            }
          }),
          fetchData('others', {}),
          fetchData('wstudio', { orderBy: 'date', ascending: false })
        ]);

        // 에러 체크
        if (!storesResponse.success) throw new Error(`점포 데이터 로딩 오류: ${storesResponse.message || '알 수 없는 오류'}`);
        if (!salesResponse.success) throw new Error(`매출 데이터 로딩 오류: ${salesResponse.message || '알 수 없는 오류'}`);
        if (!purchasesResponse.success) throw new Error(`매입 데이터 로딩 오류: ${purchasesResponse.message || '알 수 없는 오류'}`);
        if (!expensesResponse.success) throw new Error(`고정비용 데이터 로딩 오류: ${expensesResponse.message || '알 수 없는 오류'}`);
        if (!othersResponse.success) throw new Error(`기타거래 데이터 로딩 오류: ${othersResponse.message || '알 수 없는 오류'}`);
        if (!wstudioResponse.success) throw new Error(`WStudio 데이터 로딩 오류: ${wstudioResponse.message || '알 수 없는 오류'}`);

        console.log('[DASHBOARD] 모든 데이터 로딩 완료');

        // 데이터 설정
        setStores(storesResponse.data || []);
        setAllData({
          sales: salesResponse.data || [],
          purchases: purchasesResponse.data || [],
          expenses: expensesResponse.data || [],
          others: othersResponse.data || [],
          wstudio: wstudioResponse.data || []
        });
        
        setLoading(false);
        // 성공적으로 데이터를 가져왔으면 루프 종료
        break;
        
      } catch (err) {
        retryCount++;
        console.error(`[DASHBOARD] 데이터 로딩 시도 ${retryCount}/${maxRetries} 실패:`, err);
        
        if (retryCount === maxRetries) {
          setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}. 인터넷 연결을 확인하고 페이지를 새로고침하세요.`);
          setLoading(false);
        } else {
          // 재시도 전 잠시 대기 (지수 백오프)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount-1)));
        }
      }
    }
  };

  // 컴포넌트 첫 마운트 시 데이터 로드
  useEffect(() => {
    if (isInitialLoad) {
      fetchAllData();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);
  
  // 선택된 연도가 변경되면 데이터 다시 불러오기
  useEffect(() => {
    if (!isInitialLoad) {
      fetchAllData();
    }
  }, [selectedYear]);
  
  // 선택된 기간이 변경되면 데이터 처리만 수행
  useEffect(() => {
    if (allData.sales?.length || allData.purchases?.length) {
      processData();
    }
  }, [periodRange, allData]);

  // 슬라이더 범위 시각화 업데이트
  useEffect(() => {
    if (sliderRef.current) {
      const min = periodRange[0];
      const max = periodRange[1];
      const totalMonths = 12;
      
      // 월 선택과 슬라이더가 정확히 정렬되도록 계산
      // 1월은 0%, 12월은 100%가 되도록 함
      const leftPos = ((min - 1) / (totalMonths - 1)) * 100;
      const rightPos = 100 - ((max - 1) / (totalMonths - 1)) * 100;

      // 1월과 12월에서 경계값 처리
      const adjustedLeftPos = min === 1 ? 0 : leftPos;
      const adjustedRightPos = max === 12 ? 0 : rightPos;

      // 선택 범위와 핸들 위치 업데이트
      const selectedRange = sliderRef.current.querySelector('.selected-range') as HTMLElement;
      const handleLeft = sliderRef.current.querySelector('.handle-left') as HTMLElement;
      const handleRight = sliderRef.current.querySelector('.handle-right') as HTMLElement;

      if (selectedRange) {
        selectedRange.style.left = `${adjustedLeftPos}%`;
        selectedRange.style.right = `${adjustedRightPos}%`;
      }

      if (handleLeft) {
        handleLeft.style.left = `${adjustedLeftPos}%`;
      }

      if (handleRight) {
        handleRight.style.right = `${adjustedRightPos}%`;
      }
    }
  }, [periodRange]);

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 기간 표시 텍스트
  const getPeriodText = () => {
    const [start, end] = periodRange;
    if (start === end) {
      return `${start}월`;
    }
    return `${start}월 ~ ${end}월`;
  };

  // 멀티 레인지 슬라이더 값 변경 핸들러
  const handleMultiRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    if (name === 'minMonth') {
      setPeriodRange([Math.min(numValue, periodRange[1]), periodRange[1]]);
    } else {
      setPeriodRange([periodRange[0], Math.max(numValue, periodRange[0])]);
    }
  };

  // 단일 월 선택 핸들러
  const handleMonthClick = (month: number) => {
    setPeriodRange([month, month]);
  };

  if (loading && (isInitialLoad || lastFetchedYear !== selectedYear)) {
    return null;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
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

        <div className="multi-range-slider-container">
          {/* 연도와 월 표시 제거 */}
          
            <MonthRangeSlider
            values={periodRange}
            onChange={(newRange) => setPeriodRange(newRange)}
            />
          
          {/* 월별 선택 버튼 제거 */}
        </div>
      </div>
      
      <div className="store-summary">
        <h2 className="summary-title">냠냠 그룹 현황 ({selectedYear}년 {getPeriodText()})</h2>
        
        <div className="summary-grid">
          {/* 냠냠 그룹 합계 카드 - 맨 좌측으로 위치 변경 */}
          {(() => {
            // 냠냠 그룹 점포들만 필터링
            const yumYumStores = storesData.filter(store => 
              [1001, 1003, 1004, 1005, 1100].includes(store.store_id)
            );
            
            // 합계 계산
            const totalSales = yumYumStores.reduce((sum, store) => sum + store.sales, 0);
            const totalPurchases = yumYumStores.reduce((sum, store) => sum + store.purchases, 0);
            const totalExpenses = yumYumStores.reduce((sum, store) => sum + store.expenses, 0);
            const totalOthers = yumYumStores.reduce((sum, store) => sum + store.others, 0);
            const totalProfit = totalSales - totalPurchases - totalExpenses - totalOthers;
            
            // 거래처별 고정비용 합계 계산
            const totalVendorExpenses: {[key: string]: number} = {};
            
            yumYumStores.forEach(store => {
              allData.expenses
                .filter(expense => 
                  expense.store_id === store.store_id && 
                  expense.year === parseInt(selectedYear) && 
                  isMonthInRange(expense.month)
                )
                .forEach(expense => {
                  const vendorInfo = Array.isArray(expense.vendors) && expense.vendors.length > 0 
                    ? expense.vendors[0] 
                    : null;
                  
                  if (vendorInfo) {
                    const vendorName = vendorInfo.vendor_name || '기타 거래처';
                    if (!totalVendorExpenses[vendorName]) {
                      totalVendorExpenses[vendorName] = 0;
                    }
                    totalVendorExpenses[vendorName] += expense.amount || 0;
                  }
                });
            });
            
            return (
              <div className="store-total-card total-card">
                <div className="store-name">냠냠 그룹 합계</div>
                <div className="store-details">
                  <div className="amount-row">
                    <span className="amount-label">총 매출</span>
                    <span className="amount-value">{formatAmount(totalSales)}원</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">총 매입</span>
                    <span className="amount-value">{formatAmount(totalPurchases)}원</span>
                  </div>
                  
                  {/* 고정비용 합계 */}
                  <div className="amount-row">
                    <span className="amount-label">총 고정비용</span>
                    <span className="amount-value">{formatAmount(totalExpenses)}원</span>
                  </div>
                  
                  {/* 거래처별 고정비용 내역 합계 */}
                  {Object.entries(totalVendorExpenses).map(([vendorName, amount]) => (
                    <div key={vendorName} className="amount-row vendor-expense">
                      <span className="amount-label">{vendorName}</span>
                      <span className="amount-value">{formatAmount(amount)}원</span>
                    </div>
                  ))}
                  
                  {/* 기타거래 합계 */}
                  <div className="amount-row">
                    <span className="amount-label">총 기타거래</span>
                    <span className="amount-value">{formatAmount(totalOthers)}원</span>
                  </div>
                  
                  {/* 순이익 합계 */}
                  <div className="amount-row transactions">
                    <span className="amount-label">총 순이익</span>
                    <span className="amount-value">{formatAmount(totalProfit)}원</span>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {storesData
            .filter(store => [1001, 1003, 1004, 1005, 1100].includes(store.store_id))
            .map(store => {
              // 해당 점포의 거래처별 고정비용 계산
              const vendorExpenses: {[key: string]: number} = {};
              
              // 선택된 기간의 expenses 데이터 필터링
              allData.expenses
                .filter(expense => 
                  expense.store_id === store.store_id && 
                  expense.year === parseInt(selectedYear) && 
                  isMonthInRange(expense.month)
                )
                .forEach(expense => {
                  // vendors 정보 추출
                  const vendorInfo = Array.isArray(expense.vendors) && expense.vendors.length > 0 
                    ? expense.vendors[0] 
                    : null;
                  
                  if (vendorInfo) {
                    const vendorName = vendorInfo.vendor_name || '기타 거래처';
                    // 기존 항목이 없으면 초기화
                    if (!vendorExpenses[vendorName]) {
                      vendorExpenses[vendorName] = 0;
                    }
                    // 금액 누적
                    vendorExpenses[vendorName] += expense.amount || 0;
                  }
                });
              
              return (
                <div key={store.store_id} className="store-total-card">
                  <div className="store-name">{store.store_name}</div>
                  <div className="store-details">
                    <div className="amount-row">
                      <span className="amount-label">매출</span>
                      <span className="amount-value">
                        {formatAmount(store.sales)}원
                      </span>
                    </div>
                    <div className="amount-row">
                      <span className="amount-label">매입</span>
                      <span className="amount-value">{formatAmount(store.purchases)}원</span>
                    </div>
                    
                    {/* 고정비용 */}
                    <div className="amount-row">
                      <span className="amount-label">고정비용</span>
                      <span className="amount-value">{formatAmount(store.expenses)}원</span>
                    </div>
                    
                    {/* 거래처별 고정비용 내역 표시 */}
                    {Object.entries(vendorExpenses).map(([vendorName, amount]) => (
                      <div key={vendorName} className="amount-row vendor-expense">
                        <span className="amount-label">{vendorName}</span>
                        <span className="amount-value">{formatAmount(amount)}원</span>
                      </div>
                    ))}
                    
                    {/* 기타거래 */}
                    <div className="amount-row">
                      <span className="amount-label">기타거래</span>
                      <span className="amount-value">{formatAmount(store.others)}원</span>
                    </div>
                    
                    <div className="amount-row transactions">
                      <span className="amount-label">순이익</span>
                      <span className="amount-value">{formatAmount(store.sales - store.purchases - store.expenses - store.others)}원</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="store-summary">
        <h2 className="summary-title">기타 점포 현황 ({selectedYear}년 {getPeriodText()})</h2>
        
        <div className="summary-grid">
          {/* 기타 점포 그룹 합계 카드 - 맨 좌측으로 위치 변경 */}
          {(() => {
            // 기타 점포들만 필터링
            const otherStores = storesData.filter(store => 
              ![1001, 1003, 1004, 1005, 1100].includes(store.store_id)
            );
            
            // 합계 계산
            const totalSales = otherStores.reduce((sum, store) => sum + store.sales, 0);
            const totalPurchases = otherStores.reduce((sum, store) => sum + store.purchases, 0);
            const totalExpenses = otherStores.reduce((sum, store) => sum + store.expenses, 0);
            const totalOthers = otherStores.reduce((sum, store) => sum + store.others, 0);
            const totalProfit = totalSales - totalPurchases - totalExpenses - totalOthers;
            
            // 거래처별 고정비용 합계 계산
            const totalVendorExpenses: {[key: string]: number} = {};
            
            otherStores.forEach(store => {
              allData.expenses
                .filter(expense => 
                  expense.store_id === store.store_id && 
                  expense.year === parseInt(selectedYear) && 
                  isMonthInRange(expense.month)
                )
                .forEach(expense => {
                  const vendorInfo = Array.isArray(expense.vendors) && expense.vendors.length > 0 
                    ? expense.vendors[0] 
                    : null;
                  
                  if (vendorInfo) {
                    const vendorName = vendorInfo.vendor_name || '기타 거래처';
                    if (!totalVendorExpenses[vendorName]) {
                      totalVendorExpenses[vendorName] = 0;
                    }
                    totalVendorExpenses[vendorName] += expense.amount || 0;
                  }
                });
            });
            
            return (
              <div className="store-total-card total-card">
                <div className="store-name">기타 점포 합계</div>
                <div className="store-details">
                  <div className="amount-row">
                    <span className="amount-label">총 매출</span>
                    <span className="amount-value">{formatAmount(totalSales)}원</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">총 매입</span>
                    <span className="amount-value">{formatAmount(totalPurchases)}원</span>
                  </div>
                  
                  {/* 고정비용 합계 */}
                  <div className="amount-row">
                    <span className="amount-label">총 고정비용</span>
                    <span className="amount-value">{formatAmount(totalExpenses)}원</span>
                  </div>
                  
                  {/* 거래처별 고정비용 내역 합계 */}
                  {Object.entries(totalVendorExpenses).map(([vendorName, amount]) => (
                    <div key={vendorName} className="amount-row vendor-expense">
                      <span className="amount-label">{vendorName}</span>
                      <span className="amount-value">{formatAmount(amount)}원</span>
                    </div>
                  ))}
                  
                  {/* 기타거래 합계 */}
                  <div className="amount-row">
                    <span className="amount-label">총 기타거래</span>
                    <span className="amount-value">{formatAmount(totalOthers)}원</span>
                  </div>
                  
                  {/* 순이익 합계 */}
                  <div className="amount-row transactions">
                    <span className="amount-label">총 순이익</span>
                    <span className="amount-value">{formatAmount(totalProfit)}원</span>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {storesData
            .filter(store => ![1001, 1003, 1004, 1005, 1100].includes(store.store_id))
            .map(store => {
              // 해당 점포의 거래처별 고정비용 계산
              const vendorExpenses: {[key: string]: number} = {};
              
              // 선택된 기간의 expenses 데이터 필터링
              allData.expenses
                .filter(expense => 
                  expense.store_id === store.store_id && 
                  expense.year === parseInt(selectedYear) && 
                  isMonthInRange(expense.month)
                )
                .forEach(expense => {
                  // vendors 정보 추출
                  const vendorInfo = Array.isArray(expense.vendors) && expense.vendors.length > 0 
                    ? expense.vendors[0] 
                    : null;
                  
                  if (vendorInfo) {
                    const vendorName = vendorInfo.vendor_name || '기타 거래처';
                    // 기존 항목이 없으면 초기화
                    if (!vendorExpenses[vendorName]) {
                      vendorExpenses[vendorName] = 0;
                    }
                    // 금액 누적
                    vendorExpenses[vendorName] += expense.amount || 0;
                  }
                });
              
              return (
                <div key={store.store_id} className="store-total-card">
                  <div className="store-name">{store.store_name}</div>
                  <div className="store-details">
                    <div className="amount-row">
                      <span className="amount-label">매출</span>
                      <span className="amount-value">
                        {formatAmount(store.sales)}원
                      </span>
                    </div>
                    <div className="amount-row">
                      <span className="amount-label">매입</span>
                      <span className="amount-value">{formatAmount(store.purchases)}원</span>
                    </div>
                    
                    {/* 고정비용 */}
                    <div className="amount-row">
                      <span className="amount-label">고정비용</span>
                      <span className="amount-value">{formatAmount(store.expenses)}원</span>
                    </div>
                    
                    {/* 거래처별 고정비용 내역 표시 */}
                    {Object.entries(vendorExpenses).map(([vendorName, amount]) => (
                      <div key={vendorName} className="amount-row vendor-expense">
                        <span className="amount-label">{vendorName}</span>
                        <span className="amount-value">{formatAmount(amount)}원</span>
                      </div>
                    ))}
                    
                    {/* 기타거래 */}
                    <div className="amount-row">
                      <span className="amount-label">기타거래</span>
                      <span className="amount-value">{formatAmount(store.others)}원</span>
                    </div>
                    
                    <div className="amount-row transactions">
                      <span className="amount-label">순이익</span>
                      <span className="amount-value">{formatAmount(store.sales - store.purchases - store.expenses - store.others)}원</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
} 