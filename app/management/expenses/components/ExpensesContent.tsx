'use client';

import { useEffect, useState, Dispatch, SetStateAction, useCallback } from 'react';
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
  sort_order: number;
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
  // 기본 상태 관리
  const [stores, setStores] = useState<StoreData[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  // 사용자 입력값 (키: storeId-vendorId 형식)
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 외부에서 저장 상태를 관리하는 경우
  useEffect(() => {
    if (externalIsSaving !== undefined) {
      setIsSaving(externalIsSaving);
    }
  }, [externalIsSaving]);

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

  // 연도 및 월 옵션
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 입력값 변경 시 hasChanges 업데이트
  useEffect(() => {
    setHasChanges(Object.keys(inputValues).length > 0);
  }, [inputValues]);

  // 연도/월 변경 시 입력값 초기화
  useEffect(() => {
    setInputValues({});
  }, [selectedYear, selectedMonth]);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`데이터 로드 시작: ${selectedYear}년 ${selectedMonth}월`);
      
      // 매장, 거래처, 비용 데이터 로드
      const [storesRes, vendorsRes, expensesRes] = await Promise.all([
        fetchData('stores', { select: 'store_id, store_name', orderBy: 'store_id' }),
        fetchData('vendors', { select: 'id, vendor_name, store_id, category, sort_order', orderBy: 'store_id, sort_order' }),
        fetchData('expenses', { 
          filters: { 
            and: [
              { year: selectedYear },
              { month: selectedMonth }
            ]
          }
        })
      ]);
      
      // 에러 체크
      if (storesRes.error || vendorsRes.error || expensesRes.error) {
        throw new Error('데이터 로드 중 오류가 발생했습니다.');
      }
      
      // 데이터 설정
      setStores(storesRes.data || []);
      setVendors((vendorsRes.data || []).filter((v: VendorData) => v.category !== '매입'));
      setExpenses(expensesRes.data || []);
      
      console.log(`데이터 로드 완료: 매장 ${storesRes.data?.length || 0}개, 거래처 ${vendorsRes.data?.length || 0}개, 비용 ${expensesRes.data?.length || 0}개`);
      
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // 컴포넌트 마운트 및 연도/월 변경 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 입력값 변경 핸들러 (가장 단순한 형태로 구현)
  const handleInputChange = useCallback((storeId: number, vendorId: number, value: string) => {
    const key = `${storeId}-${vendorId}`;
    
    // 입력값 설정 (복잡한 로직 없이)
    setInputValues(prev => {
      const newValues = { ...prev };
      
      if (value === '') {
        // 빈 값이면 키 삭제
        delete newValues[key];
      } else {
        // 그 외에는 그대로 저장
        newValues[key] = value;
      }
      
      return newValues;
    });
  }, []);

  // 저장 함수
  const handleSave = useCallback(async () => {
    if (Object.keys(inputValues).length === 0) {
      return;
    }
    
    setIsSaving(true);
    setLoading(true);
    
    try {
      const promises = [];
      
      // 각 입력값에 대해 저장 처리
      for (const key in inputValues) {
        const [storeId, vendorId] = key.split('-').map(Number);
        const amount = parseInt(inputValues[key].replace(/,/g, ''), 10);
        
        if (isNaN(amount)) continue;
        
        // 현재 선택된 연월에 해당하는 기존 데이터 찾기
        const existingExpense = expenses.find(e => 
          e.store_id === storeId && 
          e.vendor_id === vendorId
        );
        
        if (existingExpense) {
          // 기존 데이터 업데이트
          promises.push(
            updateData('expenses', { id: existingExpense.id }, { amount })
          );
        } else {
          // 신규 데이터 저장
          promises.push(
            insertData('expenses', {
              year: selectedYear,
              month: selectedMonth,
              store_id: storeId,
              vendor_id: vendorId,
              amount
            })
          );
        }
      }
      
      // 모든 저장 요청 처리
      await Promise.all(promises);
      
      // 저장 후 데이터 새로고침
      await loadData();
      
      // 입력값 초기화
      setInputValues({});
      
    } catch (err) {
      console.error('저장 오류:', err);
      setError('데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  }, [inputValues, expenses, selectedYear, selectedMonth, loadData]);

  // 저장 함수 레퍼런스 공유
  useEffect(() => {
    if (onSaveFnChange) {
      onSaveFnChange(handleSave);
    }
  }, [handleSave, onSaveFnChange]);

  // 지난 달 데이터 복사
  const handleCopyPrev = useCallback(async () => {
    setLoading(true);
    
    try {
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      
      // 지난 달 데이터 로드
      const prevExpensesRes = await fetchData('expenses', { 
        filters: { 
          and: [
            { year: prevYear },
            { month: prevMonth }
          ]
        }
      });
      
      if (prevExpensesRes.error) {
        throw new Error('지난 달 데이터를 불러오는 중 오류가 발생했습니다.');
      }
      
      const prevExpenses = prevExpensesRes.data || [];
      
      if (prevExpenses.length === 0) {
        setError('지난 달 데이터가 없습니다.');
        return;
      }
      
      // 지난 달 데이터로 입력값 설정
      const newInputs: {[key: string]: string} = {};
      
      prevExpenses.forEach((expense: ExpenseData) => {
        const key = `${expense.store_id}-${expense.vendor_id}`;
        newInputs[key] = expense.amount.toString();
      });
      
      setInputValues(newInputs);
      
    } catch (err) {
      console.error('지난 달 데이터 복사 오류:', err);
      setError('지난 달 데이터 복사 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // 특정 매장, 거래처의 현재 비용 조회
  const getCurrentExpense = useCallback((storeId: number, vendorId: number) => {
    return expenses.find(e => 
      e.store_id === storeId && 
      e.vendor_id === vendorId
    );
  }, [expenses]);

  // 매장별 총 비용 계산
  const calculateTotalExpense = useCallback((storeId: number) => {
    // 해당 매장의 모든 거래처
    const storeVendors = vendors.filter(v => v.store_id === storeId);
    
    // 총 비용 계산
    let total = 0;
    
    storeVendors.forEach(vendor => {
      const key = `${storeId}-${vendor.id}`;
      
      if (inputValues[key]) {
        // 입력값이 있는 경우
        const amount = parseInt(inputValues[key].replace(/,/g, ''), 10);
        if (!isNaN(amount)) {
          total += amount;
        }
      } else {
        // 기존 데이터 사용
        const expense = getCurrentExpense(storeId, vendor.id);
        if (expense) {
          total += expense.amount;
        }
      }
    });
    
    return total;
  }, [vendors, inputValues, getCurrentExpense]);

  // 컨텐츠 렌더링
  return (
    <div className="expenses-content">
      {/* 연도/월 선택 필터 */}
      <div className="date-filters">
        <div className="select-wrapper">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
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
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="month-select"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </select>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      )}

      {/* 비용 데이터 표시 */}
      {!error && (
        <div className="store-summary">
          <h2 className="summary-title">
            점포별 고정비용 현황
            <span className="month">{selectedYear}년 {selectedMonth}월</span>
            <button 
              className="btn btn-secondary copy-button"
              onClick={handleCopyPrev}
              disabled={loading}
            >
              지난 달 비용 복사
            </button>
          </h2>
          
          {/* 매장 목록 */}
          <div className="store-cards">
            {stores.map(store => {
              // 해당 매장의 거래처들
              const storeVendors = vendors.filter(v => v.store_id === store.store_id);
              
              // 총 비용
              const totalExpense = calculateTotalExpense(store.store_id);
              
              return (
                <div key={store.store_id} className="store-card">
                  <div className="store-header">
                    <h3>{store.store_name}</h3>
                    <div className="store-total">
                      총액: {totalExpense.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                  
                  <div className="vendor-list">
                    {storeVendors.map(vendor => {
                      // 현재 입력값 또는 DB 값
                      const key = `${store.store_id}-${vendor.id}`;
                      const currentValue = inputValues[key] || '';
                      
                      // DB에 저장된 금액
                      const dbExpense = getCurrentExpense(store.store_id, vendor.id);
                      const dbAmount = dbExpense?.amount || 0;
                      
                      return (
                        <div key={vendor.id} className="vendor-item">
                          <div className="vendor-name">{vendor.category}</div>
                          <div className="vendor-input">
                            <input
                              type="text"
                              value={currentValue}
                              placeholder={dbAmount.toLocaleString('ko-KR')}
                              onChange={(e) => handleInputChange(store.store_id, vendor.id, e.target.value)}
                            />
                            <span>원</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <style jsx>{`
        .expenses-content {
          padding: 20px;
          position: relative;
        }
        
        .date-filters {
          display: flex;
          margin-bottom: 20px;
        }
        
        .select-wrapper {
          margin-right: 10px;
        }
        
        select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ccc;
          background-color: white;
        }
        
        .error-state {
          background-color: #ffebee;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .store-summary {
          margin-bottom: 30px;
        }
        
        .summary-title {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .month {
          margin-left: 10px;
          font-size: 16px;
          color: #666;
        }
        
        .copy-button {
          margin-left: auto;
          font-size: 14px;
          padding: 5px 10px;
        }
        
        .store-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .store-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 15px;
          width: 300px;
        }
        
        .store-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .store-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .store-total {
          font-weight: bold;
        }
        
        .vendor-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .vendor-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .vendor-name {
          flex: 1;
        }
        
        .vendor-input {
          display: flex;
          align-items: center;
        }
        
        .vendor-input input {
          width: 120px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
          text-align: right;
          margin-right: 5px;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255,255,255,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 