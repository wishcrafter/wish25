'use client';

import { useEffect, useState, Dispatch, SetStateAction, useRef, useCallback } from 'react';
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
  // 상태 관리
  const [stores, setStores] = useState<StoreData[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [expensesAll, setExpensesAll] = useState<ExpenseData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  // 참조 객체로 상태 변화를 추적하여 최신 상태 보장
  const inputsRef = useRef<{ [key: string]: string }>({});
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // 연도 옵션 생성 (number 타입)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  // 월 옵션 생성 (number 타입)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 1. 연도/월 변경 시 inputs 초기화
  useEffect(() => {
    setInputs({});
    inputsRef.current = {};
    setHasChanges(false);
  }, [selectedYear, selectedMonth]);

  // 2. 입력값 변경 시 저장버튼 활성화
  useEffect(() => {
    const hasEntries = Object.keys(inputs).length > 0;
    setHasChanges(hasEntries);
  }, [inputs]);

  // 데이터 fetch (연도/월 변경 시 한 번에) - 데이터 매핑 개선
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // 이번달과 지난달 데이터를 한 번에 가져옴
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      
      console.log(`데이터 로드 시작: ${selectedYear}년 ${selectedMonth}월 및 ${prevYear}년 ${prevMonth}월`);
      
      // 데이터를 명확하게 가져오기 위해 필터 개선
      const expensesFilters = {
        filters: {
          or: [
            { and: [
              { year: selectedYear }, 
              { month: selectedMonth }
            ]},
            { and: [
              { year: prevYear }, 
              { month: prevMonth }
            ]}
          ]
        }
      };
      
      console.log('데이터 로드 필터:', JSON.stringify(expensesFilters));
      
      // 각 테이블 데이터 로드 
      const [storesRes, vendorsRes, expensesRes] = await Promise.all([
        fetchData('stores', { select: 'store_id, store_name', orderBy: 'store_id' }),
        fetchData('vendors', { select: 'id, vendor_name, store_id, category, sort_order', orderBy: 'store_id, sort_order' }),
        fetchData('expenses', expensesFilters)
      ]);
      
      if (storesRes.error) {
        console.error('매장 데이터 로드 오류:', storesRes.error);
        setError('매장 정보를 불러오는 중 오류가 발생했습니다.');
        return;
      }
      
      if (vendorsRes.error) {
        console.error('거래처 데이터 로드 오류:', vendorsRes.error);
        setError('거래처 정보를 불러오는 중 오류가 발생했습니다.');
        return;
      }
      
      if (expensesRes.error) {
        console.error('지출 데이터 로드 오류:', expensesRes.error);
        setError('지출 정보를 불러오는 중 오류가 발생했습니다.');
        return;
      }
      
      // 매장 및 거래처 현황 로깅
      const storeCount = storesRes.data?.length || 0;
      const vendorCount = vendorsRes.data?.length || 0;
      
      console.log(`매장 ${storeCount}개, 거래처 ${vendorCount}개 로드됨`);
      
      if (storeCount > 0) {
        console.log('매장 샘플:', storesRes.data?.[0]);
      }
      
      if (vendorCount > 0) {
        console.log('거래처 샘플:', vendorsRes.data?.[0]);
      }
      
      // 필터링된 데이터 설정
      setStores(storesRes.data || []);
      // 매입 제외
      const filteredVendors = (vendorsRes.data || []).filter((v: VendorData) => v.category !== '매입');
      setVendors(filteredVendors);
      
      // 비용 데이터 확인 로깅
      const expenseCount = expensesRes.data?.length || 0;
      console.log(`총 ${expenseCount}개 비용 데이터 로드됨`);
      
      if (expenseCount > 0) {
        console.log('비용 데이터 샘플:', expensesRes.data?.[0]);
        
        // 테이블 간 ID 매핑 유효성 검사
        const storeIds = new Set(storesRes.data?.map((s: StoreData) => s.store_id) || []);
        const vendorIds = new Set(vendorsRes.data?.map((v: VendorData) => v.id) || []);
        
        // 없는 store_id 또는 vendor_id 식별
        const invalidStoreIds = new Set();
        const invalidVendorIds = new Set();
        
        expensesRes.data?.forEach((expense: ExpenseData) => {
          if (!storeIds.has(expense.store_id)) {
            invalidStoreIds.add(expense.store_id);
          }
          
          if (!vendorIds.has(expense.vendor_id)) {
            invalidVendorIds.add(expense.vendor_id);
          }
        });
        
        if (invalidStoreIds.size > 0) {
          console.warn('유효하지 않은 store_id 발견:', Array.from(invalidStoreIds));
        }
        
        if (invalidVendorIds.size > 0) {
          console.warn('유효하지 않은 vendor_id 발견:', Array.from(invalidVendorIds));
        }
      }
      
      setExpensesAll(expensesRes.data || []);
    } catch (err) {
      console.error('데이터 로딩 중 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // 연도/월 변경 시 데이터 새로고침
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // 입력값 변경을 안전하게 처리하는 함수
  const handleAmountChange = useCallback((storeId: number, vendorId: number, value: string) => {
    const key = `${storeId}-${vendorId}`;
    const numOnly = value.replace(/[^0-9]/g, '');
    
    console.log(`입력 변경: ${storeId}-${vendorId}, 값: ${numOnly}`);
      
    // inputsRef로 항상 최신 상태 참조 보장
    const updatedInputs = {
      ...inputsRef.current,
      [key]: numOnly
    };

    // 입력값이 빈 문자열이면 해당 키를 제거
    if (numOnly === '') {
      delete updatedInputs[key];
    }
    
    // 참조와 상태 모두 업데이트
    inputsRef.current = updatedInputs;
    setInputs({...updatedInputs});
    
    console.log('현재 입력값들:', Object.keys(updatedInputs).length);
  }, []);

  // 저장 로직 - 안정적으로 개선 (데이터 불일치 문제 해결)
  const handleSave = useCallback(async () => {
    if (Object.keys(inputsRef.current).length === 0) return;
    
    setIsSaving(true);
    setLoading(true);
    
    try {
      const savePromises = [];
      const currYear = selectedYear;
      const currMonth = selectedMonth;
      
      console.log(`저장 중: ${currYear}년 ${currMonth}월 데이터, 총 ${Object.keys(inputsRef.current).length}개`);
      
      // 입력값을 순차적으로 저장 (모든 key 순회)
      for (const key in inputsRef.current) {
        if (!inputsRef.current[key]) continue; // 빈 값 제외
        
        const [storeId, vendorId] = key.split('-').map(Number);
        const amount = parseInt(inputsRef.current[key], 10);
        
        if (isNaN(amount)) continue; // 유효하지 않은 숫자 제외
        
        // 기존 데이터 확인 (정확한 매칭을 위해 로그 추가)
        const existingRecord = expensesAll.find(e => 
          e.store_id === storeId && 
          e.vendor_id === vendorId &&
          e.year === currYear && 
          e.month === currMonth
        );
        
        console.log(`저장 데이터 확인 - 매장: ${storeId}, 거래처: ${vendorId}, 금액: ${amount}원, 기존 데이터: ${existingRecord ? `ID ${existingRecord.id}, 금액 ${existingRecord.amount}` : '없음'}`);
        
        // 업데이트 또는 신규 등록 (디버깅 정보 추가)
        if (existingRecord) {
          console.log(`업데이트: ID ${existingRecord.id}, 금액 ${amount}원`);
          savePromises.push(
            updateData('expenses', { id: existingRecord.id }, { amount })
              .then(result => {
                if (result.error) {
                  console.error(`ID ${existingRecord.id} 업데이트 실패:`, result.error);
                } else {
                  console.log(`ID ${existingRecord.id} 업데이트 성공`);
                }
                return result;
              })
          );
        } else {
          console.log(`신규 등록: 연도 ${currYear}, 월 ${currMonth}, 매장 ${storeId}, 거래처 ${vendorId}, 금액 ${amount}원`);
          savePromises.push(
            insertData('expenses', {
              year: currYear,
              month: currMonth,
              store_id: storeId,
              vendor_id: vendorId,
              amount
            }).then(result => {
              if (result.error) {
                console.error(`신규 데이터 저장 실패:`, result.error);
              } else {
                console.log(`신규 데이터 저장 성공, ID: ${result.data?.id}`);
              }
              return result;
            })
          );
        }
      }
      
      // 모든 요청을 Promise.all로 병렬 처리
      const results = await Promise.all(savePromises);
      console.log(`총 ${results.length}개 데이터 저장 완료`);
      
      // 변경 사항 초기화 및 데이터 새로고침
      inputsRef.current = {};
      setInputs({});
      await fetchAll();
      setHasChanges(false);
      
    } catch (err) {
      console.error('저장 중 오류:', err);
      setError('데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  }, [fetchAll, selectedYear, selectedMonth, expensesAll]);

  // 저장 함수 레퍼런스 공유
  useEffect(() => {
    if (onSaveFnChange) {
      onSaveFnChange(handleSave);
    }
  }, [handleSave, onSaveFnChange]);

  // 지난 달 복사
  const handleCopyPrev = useCallback(async () => {
    setLoading(true);
    
    try {
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
      // 지난달 데이터 필터링
      const prevExpenses = expensesAll.filter(e => 
        e.year === prevYear && e.month === prevMonth
      );
      
      if (prevExpenses.length === 0) {
        setError('지난 달 데이터가 없습니다.');
        return;
      }
      
      // 새 입력값으로 설정 (직접 string으로 변환)
      const newInputs: { [key: string]: string } = {};
      prevExpenses.forEach(expense => {
        const key = `${expense.store_id}-${expense.vendor_id}`;
        newInputs[key] = expense.amount.toString();
    });
    
      // inputs 상태와 참조 모두 업데이트
      inputsRef.current = newInputs;
      setInputs(newInputs);
    setHasChanges(true);
    
    } catch (err) {
      console.error('지난 달 데이터 복사 중 오류:', err);
      setError('지난 달 데이터 복사 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [expensesAll, selectedYear, selectedMonth]);

  // 특정 매장, 거래처의 이번달 비용 조회 (데이터 불일치 문제 해결)
  const getCurrentMonthExpense = useCallback((storeId: number, vendorId: number) => {
    // 데이터 매핑 문제 확인을 위한 로깅
    const foundExpense = expensesAll.find(e => 
      e.store_id === storeId && 
      e.vendor_id === vendorId && 
      e.year === selectedYear && 
      e.month === selectedMonth
    );
    
    if (foundExpense) {
      console.log(`현재 월 데이터 찾음: 매장 ${storeId}, 거래처 ${vendorId}, 금액 ${foundExpense.amount}`);
    }
    
    return foundExpense;
  }, [expensesAll, selectedYear, selectedMonth]);

  // 특정 매장, 거래처의 지난달 비용 조회 (데이터 불일치 문제 해결)
  const getPrevMonthExpense = useCallback((storeId: number, vendorId: number) => {
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    // 데이터 매핑 문제 확인을 위한 로깅
    const foundExpense = expensesAll.find(e => 
      e.store_id === storeId && 
      e.vendor_id === vendorId && 
      e.year === prevYear && 
      e.month === prevMonth
    );
    
    if (foundExpense) {
      console.log(`이전 월 데이터 찾음: 매장 ${storeId}, 거래처 ${vendorId}, 금액 ${foundExpense.amount}`);
    }
    
    return foundExpense;
  }, [expensesAll, selectedYear, selectedMonth]);

  // 점포별 비용 계산 (이번달)
  const calculateStoreExpenses = useCallback((storeId: number) => {
    // 현재 선택된 연월에 해당하는 비용만 필터링
    const storeExpenses = expensesAll.filter(e => 
      e.store_id === storeId && 
      e.year === selectedYear && 
      e.month === selectedMonth
    );
    
    const storeVendors = vendors.filter(v => v.store_id === storeId);
    
    // 입력값과 DB값을 모두 고려하여 총액 계산
    let total = 0;
    
    storeVendors.forEach(vendor => {
      const key = `${storeId}-${vendor.id}`;
      const inputAmount = inputsRef.current[key] ? parseInt(inputsRef.current[key], 10) : 0;
      
      if (inputsRef.current[key]) {
        // 입력값이 있으면 그 값 사용
        total += inputAmount;
      } else {
        // 입력값이 없으면 DB값 사용
        const dbExpense = storeExpenses.find(e => e.vendor_id === vendor.id);
        total += dbExpense?.amount || 0;
      }
    });
    
    return {
      total,
      expenses: storeVendors.map(vendor => {
          const expense = storeExpenses.find(e => e.vendor_id === vendor.id);
          return {
            vendor_id: vendor.id,
            category: vendor.category,
            amount: expense?.amount || 0
          };
        })
    };
  }, [expensesAll, selectedYear, selectedMonth, vendors]);

  // 지난달 비용 계산
  const calculatePreviousMonthStoreExpenses = useCallback((storeId: number) => {
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    const storeExpenses = expensesAll.filter(e => 
      e.store_id === storeId && 
      e.year === prevYear && 
      e.month === prevMonth
    );

    return {
      total: storeExpenses.reduce((sum, e) => sum + e.amount, 0),
      expenses: storeExpenses
    };
  }, [expensesAll, selectedYear, selectedMonth]);

  // 점포별 비용 표시
  const renderStoreExpenses = useCallback(() => {
    // 점포를 두 그룹으로 나누기
    const firstRowStores = stores.filter(store => [1001, 1003, 1004, 1005, 1100].includes(store.store_id));
    const secondRowStores = stores.filter(store => [2001, 3001, 9001].includes(store.store_id));

    // 현재 달 및 이전 달 계산
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

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
              onClick={handleCopyPrev}
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
  }, [
    stores, 
    selectedYear, 
    selectedMonth, 
    loading, 
    handleCopyPrev
  ]);

  // 매장 카드 렌더링 함수
  const renderStoreCard = useCallback((store: StoreData, isCurrentMonth: boolean) => {
    // 해당 매장의 거래처 목록
    const vendorsList = vendors.filter(v => v.store_id === store.store_id);
    
    // 계산된 데이터 가져오기
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
            <span className="amount-value">{storeData.total.toLocaleString('ko-KR')}원</span>
          </div>
          
          {/* 거래처별 비용 표시 */}
          {vendorsList.length > 0 ? (
            vendorsList.map(vendor => {
              // 현재 달인 경우 편집 가능한 입력 필드 표시
              if (isCurrentMonth) {
                const key = `${store.store_id}-${vendor.id}`;
                
                // 입력값 가져오기 (현재 입력 상태에서 확인)
                const inputValue = inputs[key] || '';
                
                // DB에 저장된 기존 금액 (없으면 0)
                const dbExpense = getCurrentMonthExpense(store.store_id, vendor.id);
                const dbAmount = dbExpense?.amount || 0;
                
                // 사용자가 입력 중인 값 또는 DB에서 가져온 값 표시
                const displayValue = inputValue || ''; // 실제 입력 필드 값
                const placeholderText = dbAmount ? dbAmount.toLocaleString('ko-KR') : '0';  // placeholder 값
                
                return (
                  <div key={vendor.id} className="amount-row vendor">
                    <span className="amount-label">{vendor.category}</span>
                    <div className="amount-input-wrapper">
                      <input
                        type="text"
                        className="amount-input"
                        value={displayValue}
                        placeholder={placeholderText}
                        onChange={(e) => handleAmountChange(store.store_id, vendor.id, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <span className="amount-unit">원</span>
                    </div>
                  </div>
                );
              } else {
                // 지난 달 데이터는 읽기 전용 표시
                const prevExpense = getPrevMonthExpense(store.store_id, vendor.id);
                const amount = prevExpense?.amount || 0;
                
                return (
                  <div key={vendor.id} className="amount-row vendor">
                    <span className="amount-label">{vendor.category}</span>
                    <span className="amount-value">{amount.toLocaleString('ko-KR')}원</span>
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
  }, [
    vendors, 
    calculateStoreExpenses, 
    calculatePreviousMonthStoreExpenses, 
    getCurrentMonthExpense,
    getPrevMonthExpense,
    handleAmountChange
  ]);

  // 컴포넌트 렌더링
  return (
    <div className="expenses-content expenses-page">
      {(!onSaveFnChange || !onHasChangesChange) && (
        <div className="page-actions">
        <button 
          className="btn btn-primary"
            onClick={handleSave}
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