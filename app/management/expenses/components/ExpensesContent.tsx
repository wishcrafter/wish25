'use client';

import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { fetchData, insertData, updateData } from '../../../../utils/supabase-client-api';

// 비용 데이터 인터페이스
interface ExpenseData {
  id: number;
  store_id: number;
  vendor_id: number;
  year: number;
  month: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

// 거래처 데이터 인터페이스
interface VendorData {
  id: number;
  vendor_name: string;
  store_id: number;
  category: string;
  order: number;
}

// 매장 데이터 인터페이스
interface StoreData {
  store_id: number;
  store_name: string;
}

// 컴포넌트 Props 인터페이스
interface ExpenseContentProps {
  onLoadingChange?: Dispatch<SetStateAction<boolean>>;
  onErrorChange?: Dispatch<SetStateAction<string | null>>;
  onSaveFnChange?: (fn: () => Promise<boolean | void>) => void;
  onHasChangesChange?: Dispatch<SetStateAction<boolean>>;
  isSaving?: boolean;
}

export default function ExpensesContent({
  onLoadingChange,
  onErrorChange,
  onSaveFnChange,
  onHasChangesChange,
  isSaving: externalIsSaving
}: ExpenseContentProps) {
  // 상태 관리
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [editedExpenses, setEditedExpenses] = useState<{[key: string]: number}>({});
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  // 로딩 상태 변경 시 부모에게 전달
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  // 에러 상태 변경 시 부모에게 전달
  useEffect(() => {
    if (onErrorChange) {
      onErrorChange(error);
    }
  }, [error, onErrorChange]);

  // 변경 상태 변경 시 부모에게 전달
  useEffect(() => {
    if (onHasChangesChange) {
      onHasChangesChange(hasChanges);
    }
  }, [hasChanges, onHasChangesChange]);

  // 외부에서 저장 상태를 관리하는 경우
  useEffect(() => {
    if (externalIsSaving !== undefined) {
      setIsSaving(externalIsSaving);
    }
  }, [externalIsSaving]);

  // 저장 함수 레퍼런스 공유
  useEffect(() => {
    if (onSaveFnChange) {
      onSaveFnChange(saveAndRefresh);
    }
  }, [onSaveFnChange]);

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
      const response = await fetchData('stores', {
        select: 'store_id, store_name',
        filters: {
          in: {
            'store_id': [1001, 1003, 1004, 1005, 1100, 2001, 3001, 9001]
          }
        },
        orderBy: 'store_id'
      });

      if (!response.success) {
        throw new Error('점포 데이터 조회 실패');
      }
      
      setStores(response.data || []);
      return true;
    } catch (err: any) {
      setError(`점포 데이터 로딩 오류: ${err.message}`);
      return false;
    }
  };

  // 거래처 목록을 가져오는 함수
  const fetchVendors = async () => {
    try {
      const response = await fetchData('vendors', {
        select: 'id, vendor_name, store_id, category, order',
        filters: {
          neq: {
            'category': '매입'
          }
        },
        orderBy: 'store_id, order'
      });

      if (!response.success) {
        throw new Error('거래처 데이터 조회 실패');
      }
      
      setVendors(response.data || []);
      return true;
    } catch (err: any) {
      setError(`거래처 데이터 로딩 오류: ${err.message}`);
      return false;
    }
  };

  // 비용 데이터를 가져오는 함수
  const fetchExpenses = async () => {
    try {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      
      // 이번달과 지난달 계산
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
      }
      
      // API를 통해 비용 데이터 조회
      const response = await fetchData('expenses', {
        filters: {
          or: [
            { year: year, month: month },
            { year: prevYear, month: prevMonth }
          ]
        },
        orderBy: 'store_id, vendor_id'
      });

      if (!response.success) {
        throw new Error('비용 데이터 조회 실패');
      }
      
      setExpenses(response.data || []);
      
      // 데이터 로드 후 편집 상태 초기화
      setEditedExpenses({});
      setInputValues({});
      return true;
    } catch (err: any) {
      setError(`비용 데이터 로딩 오류: ${err.message}`);
      return false;
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      
      try {
        // 필요한 데이터 로드
        const storesSuccessful = await fetchStores();
        const vendorsSuccessful = await fetchVendors();
        const expensesSuccessful = await fetchExpenses();
        
        // 전체 에러 여부 판단
        if (!storesSuccessful || !vendorsSuccessful || !expensesSuccessful) {
          const errorMessage = "데이터 로딩 중 일부 오류가 발생했습니다. 일부 데이터가 표시되지 않을 수 있습니다.";
          setError(errorMessage);
        } else {
          setError(null);
        }
        
        // 데이터 초기화 완료 표시
        setDataInitialized(true);
      } catch (err: any) {
        setError(`데이터 로딩 오류: ${err.message}`);
      } finally {
        // 로딩 상태 해제
        setLoading(false);
      }
    };

    // 즉시 초기 로딩 시작
    loadInitialData();
  }, [selectedYear, selectedMonth]);

  // 연도나 월이 변경될 때 expenses 데이터 다시 가져오기
  useEffect(() => {
    if (dataInitialized) {
    // 이전 편집 상태 초기화
    setEditedExpenses({});
    setInputValues({});
    // 새로운 데이터 불러오기
    fetchExpenses();
    }
  }, [selectedYear, selectedMonth, dataInitialized]);

  // 금액 변경 처리 (입력 중)
  const handleAmountChange = (storeId: number, vendorId: number, newAmount: string) => {
      const key = `${storeId}-${vendorId}`;
      setInputValues(prev => ({ ...prev, [key]: newAmount }));
  };

  // 입력 완료 시 실행 (포커스 벗어남)
  const handleAmountBlur = (storeId: number, vendorId: number, value: string) => {
      // 금액에서 콤마 제거
      const cleanValue = value.replace(/[^0-9]/g, '');
      const numericAmount = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
      
      // 키 생성 및 로컬 상태 업데이트
      const key = `${storeId}-${vendorId}`;
      setEditedExpenses(prev => ({ ...prev, [key]: numericAmount }));
      
      // 포맷팅된 값으로 입력값 업데이트
      setInputValues(prev => ({ ...prev, [key]: formatAmount(numericAmount) }));
      
      // 변경 사항 있음 표시
      setHasChanges(true);
  };

  // 저장하고 데이터를 새로고침하는 함수
  const saveAndRefresh = async (): Promise<boolean> => {
    if (window.confirm('변경 사항을 저장하시겠습니까?')) {
      const success = await handleSaveAll();
        if (success) {
          // 데이터베이스에서 최신 데이터 다시 가져오기
        await fetchExpenses();
        }
      return success;
    }
    return false;
  };

  // 모든 변경 사항 저장
  const handleSaveAll = async () => {
    if (!hasChanges) return false;
    
    setIsSaving(true);
    
    try {
      const updates = [];
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      
      // 편집된 비용 처리
      for (const key in editedExpenses) {
        const [storeId, vendorId] = key.split('-').map(Number);
        const amount = editedExpenses[key];
        
        // 해당 연/월/점포/거래처에 해당하는 기존 비용 데이터 찾기
        const existingExpense = expenses.find(e => 
          e.store_id === storeId && 
          e.vendor_id === vendorId &&
          e.year === year &&
          e.month === month
        );
        
        if (existingExpense) {
          // 기존 데이터 업데이트
          updates.push(updateExpense(existingExpense.id, amount));
        } else {
          // 새로운 데이터 생성
          updates.push(createExpense(storeId, vendorId, amount));
        }
      }
      
      // 모든 업데이트 동시에 처리
      await Promise.all(updates);
      
      // 성공 메시지
      alert('비용 데이터가 성공적으로 저장되었습니다.');
      
      // 변경 상태 초기화
      setHasChanges(false);
      
      return true;
    } catch (error: any) {
      alert(`비용 데이터 저장 중 오류가 발생했습니다: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 비용 업데이트 함수
  const updateExpense = async (expenseId: number, amount: number) => {
    return updateData('expenses', expenseId, { amount });
  };

  // 새 비용 생성 함수
  const createExpense = async (storeId: number, vendorId: number, amount: number) => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    
    return insertData('expenses', {
      year,
      month,
      store_id: storeId,
      vendor_id: vendorId,
      amount
    });
  };

  // 이전 달 비용을 현재 달로 복사하는 함수
  const copyPreviousMonthExpenses = () => {
    const currentYear = parseInt(selectedYear);
    const currentMonth = parseInt(selectedMonth);
    
    // 이전 달 계산
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // 복사할 값 임시 저장
    const newEditedExpenses = { ...editedExpenses };
    const newInputValues = { ...inputValues };
    
    // 모든 점포와 거래처에 대해 이전 달 값을 찾아 현재 달로 복사
    stores.forEach(store => {
      const vendorsList = vendors.filter(v => v.store_id === store.store_id);
      
      vendorsList.forEach(vendor => {
        // 해당 점포 및 거래처의 이전 달 비용 찾기
        const prevExpense = expenses.find(e => 
          e.store_id === store.store_id && 
          e.vendor_id === vendor.id &&
          e.year === prevYear && 
          e.month === prevMonth
        );
        
        if (prevExpense) {
          // 키 생성
          const key = `${store.store_id}-${vendor.id}`;
          // 이전 달 값 복사
          newEditedExpenses[key] = prevExpense.amount;
          newInputValues[key] = formatAmount(prevExpense.amount);
        }
      });
    });
    
    // 상태 업데이트
    setEditedExpenses(newEditedExpenses);
    setInputValues(newInputValues);
    setHasChanges(true);
    
    alert('이전 달 비용이 복사되었습니다. 저장하려면 저장 버튼을 클릭하세요.');
  };

  // 금액 포맷팅 (원 단위 없는 버전)
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { 
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 점포별 비용 계산
  const calculateStoreExpenses = (storeId: number) => {
    // 현재 선택된 연월에 해당하는 비용만 필터링
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    
    const storeExpenses = expenses.filter(e => 
      e.store_id === storeId && 
      e.year === year && 
      e.month === month
    );
    
    return {
      total: storeExpenses.reduce((sum, e) => sum + e.amount, 0),
      expenses: vendors
        .filter(v => v.store_id === storeId)
        .map(vendor => {
          const expense = storeExpenses.find(e => e.vendor_id === vendor.id);
          return {
            vendor_id: vendor.id,
            category: vendor.category,
            amount: expense?.amount || 0
          };
        })
    };
  };

  // 지난달 비용 계산
  const calculatePreviousMonthStoreExpenses = (storeId: number) => {
    const currentYear = parseInt(selectedYear);
    const currentMonth = parseInt(selectedMonth);
    
    // 이전 달 계산
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const storeExpenses = expenses.filter(expense => 
      expense.store_id === storeId && 
      expense.year === prevYear && 
      expense.month === prevMonth
    );

    return {
      total: storeExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      expenses: storeExpenses
    };
  };

  // 점포별 비용 표시
  const renderStoreExpenses = () => {
    // 점포를 두 그룹으로 나누기
    const firstRowStores = stores.filter(store => [1001, 1003, 1004, 1005, 1100].includes(store.store_id));
    const secondRowStores = stores.filter(store => [2001, 3001, 9001].includes(store.store_id));

    // 현재 달 및 이전 달 계산
    const currentYear = parseInt(selectedYear);
    const currentMonth = parseInt(selectedMonth);
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // 점포나 거래처 데이터가 없는 경우 로딩 중임을 표시하지 않고 빈 UI 구조 반환
    return (
      <>
        {/* 현재 달 비용 */}
        <div className="store-summary">
          <h2 className="summary-title">
            점포별 고정비용 현황
            <span className="month">{selectedYear}년 {selectedMonth}월</span>
          </h2>
          
          {/* 첫 번째 행 매장들 */}
          <div className="store-cards-scroll">
            {firstRowStores.map(store => renderStoreCard(store, true))}
          </div>
          
          {/* 두 번째 행 매장들 */}
          <div className="store-cards-scroll">
            {secondRowStores.map(store => renderStoreCard(store, true))}
          </div>
        </div>

        {/* 이전 달 비용 */}
        <div className="store-summary">
          <h2 className="summary-title">
            <button 
              className="btn btn-secondary copy-button"
              onClick={copyPreviousMonthExpenses}
              disabled={loading || stores.length === 0 || vendors.length === 0}
            >
              지난 달 비용 복사
            </button>
            <span className="month">{prevYear}년 {String(prevMonth).padStart(2, '0')}월</span>
          </h2>
          
          {/* 첫 번째 행 매장들 (이전 달) */}
          <div className="store-cards-scroll">
            {firstRowStores.map(store => renderStoreCard(store, false))}
          </div>
          
          {/* 두 번째 행 매장들 (이전 달) */}
          <div className="store-cards-scroll">
            {secondRowStores.map(store => renderStoreCard(store, false))}
        </div>
      </div>
      </>
    );
  };

  // 매장 카드 렌더링 함수
  const renderStoreCard = (store: StoreData, isCurrentMonth: boolean) => {
    // 해당 매장의 거래처 목록
    const vendorsList = vendors.filter(v => v.store_id === store.store_id);
    
    // 빈 데이터 경우를 대비한 기본값 설정
    const storeData = isCurrentMonth 
      ? calculateStoreExpenses(store.store_id)
      : calculatePreviousMonthStoreExpenses(store.store_id);
    
    return (
      <div key={store.store_id} className="store-total-card">
        <div className="store-name">{store.store_name}</div>
        <div className="store-details">
          {/* 총 비용 표시 */}
          <div className="amount-row">
            <span className="amount-label">총 고정비용</span>
            <span className="amount-value">{formatAmount(storeData.total)}원</span>
          </div>
          
          {/* 거래처별 비용 표시 */}
          {vendorsList.length > 0 ? (
            vendorsList.map(vendor => {
              // 현재 달인 경우 편집 가능한 입력 필드 표시
              if (isCurrentMonth) {
                const vendorExpense = storeData.expenses.find(e => e.vendor_id === vendor.id);
                const currentAmount = vendorExpense?.amount || 0;
                const key = `${store.store_id}-${vendor.id}`;
                const editedAmount = editedExpenses[key];
                
                // 현재 표시할 금액 (입력값이 있으면 그 값, 편집된 값이 있으면 그 값, 아니면 현재 값)
                const inputValue = inputValues[key];
                const displayAmount = editedAmount !== undefined ? editedAmount : currentAmount;
                
                return (
                  <div key={vendor.id} className="amount-row vendor">
                    <span className="amount-label">{vendor.category}</span>
                    <div className="amount-input-wrapper">
                      <input
                        type="text"
                        className="amount-input"
                        value={inputValue !== undefined ? inputValue : formatAmount(displayAmount)}
                        onChange={(e) => handleAmountChange(store.store_id, vendor.id, e.target.value)}
                        onBlur={(e) => handleAmountBlur(store.store_id, vendor.id, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <span className="amount-unit">원</span>
                    </div>
                  </div>
                );
              } 
              // 이전 달인 경우 읽기 전용 값 표시
              else {
                const vendorExpense = storeData.expenses.find(e => e.vendor_id === vendor.id);
                const amount = vendorExpense?.amount || 0;
                
                return (
                  <div key={vendor.id} className="amount-row vendor">
                    <span className="amount-label">{vendor.category}</span>
                    <span className="amount-value">{formatAmount(amount)}원</span>
                  </div>
                );
              }
            })
          ) : (
            <div className="amount-row vendor">
              <span className="amount-label">데이터 준비 중...</span>
              <span className="amount-value">-</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 컴포넌트 렌더링
  return (
    <div className="expenses-content expenses-page">
      {(!onSaveFnChange || !onHasChangesChange) && (
        <div className="page-actions">
        <button 
          className="btn btn-primary"
          onClick={saveAndRefresh}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
      )}

      {/* 연도/월 선택 필터 */}
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

      {/* 에러 상태만 별도 표시 */}
      {error && (
        <div className="error-state">
          <h3>에러 발생:</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      )}

      {/* 비용 데이터 표시 - 에러가 없을 때만 표시 */}
      {!error && renderStoreExpenses()}
      
      {/* 로딩 상태 - 오버레이 방식으로 표시 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <style jsx>{`
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          pointer-events: none;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 