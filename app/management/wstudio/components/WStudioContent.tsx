'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchData, updateData } from '../../../../utils/supabase-client-api';

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

interface Store {
  store_id: number;
  store_name: string;
}

interface CustomerData {
  id: number;
  name: string;
  room_no: number | null;
  status: string;
}

// 컴포넌트 Props 인터페이스 추가
interface WStudioContentProps {
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
  onSaveFnChange?: (fn: () => Promise<boolean | void>) => void;
  onHasChangesChange?: (hasChanges: number) => void;
  isSaving?: boolean;
}

const columnMapping = {
  date: '거래일자',
  memo: '기록사항',
  amount_in: '입금액',
  estimated_room: '추정 방번호',
  room: '방번호',
  real_month: '해당월',
  real_sales: '해당매출'
} as const;

const columnStyles = {
  date: 'col-date text-center min-w-[100px] max-w-[150px]',
  memo: 'col-text text-center min-w-[100px] max-w-[150px]',
  amount_in: 'col-number text-right min-w-[100px] max-w-[150px]',
  estimated_room: 'col-number text-center min-w-[100px] max-w-[150px]',
  room: 'col-number text-right min-w-[100px] max-w-[150px]',
  real_month: 'col-number text-right min-w-[100px] max-w-[150px]',
  real_sales: 'col-number text-center min-w-[100px] max-w-[150px]'
} as const;

export default function WStudioContent(props: WStudioContentProps) {
  const { onLoadingChange, onErrorChange, onSaveFnChange, onHasChangesChange, isSaving } = props;
  const [transactions, setTransactions] = useState<WStudioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [dirtyFields, setDirtyFields] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('입실');
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  // 연도 옵션 생성 (현재 연도 기준 이전 5년)
  const years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  // 월 옵션 생성
  const months = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  // wstudio 데이터를 가져오는 함수
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // 병렬로 데이터 요청
      const [transactionsResult, customersResult] = await Promise.all([
        fetchData('wstudio', {
          select: '*',
          orderBy: 'date',
          ascending: false
        }),
        
        fetchData('w_customers', {
          select: 'id, name, room_no, status, memo',
          filters: { status: '입실' }
        })
      ]);

      // 트랜잭션 데이터 처리
      if (!transactionsResult.success) {
        setError(transactionsResult.message);
      } else if (transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }
      
      // 고객 데이터 처리
      if (!customersResult.success) {
        // 오류 발생 시 조용히 처리
      } else if (customersResult.data) {
        setCustomers(customersResult.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 고객 데이터를 가져오는 함수 추가
  const fetchCustomers = async () => {
    try {
      const result = await fetchData('w_customers', {
        select: 'id, name, room_no, status, memo',
        filters: { status: '입실' }
      });
        
      if (!result.success) {
        return;
      }
        
      if (result.data) {
        setCustomers(result.data);
      }
    } catch (err) {
      // 오류 발생 시 조용히 처리
    }
  };

  useEffect(() => {
    fetchTransactions(); // 트랜잭션과 고객 데이터를 병렬로 로드
  }, []);

  // 부모 컴포넌트에 로딩 상태 전달
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // 부모 컴포넌트에 에러 상태 전달
  useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  // 부모 컴포넌트에 변경사항 개수 전달
  useEffect(() => {
    onHasChangesChange?.(dirtyFields.size);
  }, [dirtyFields.size, onHasChangesChange]);

  // 필터링된 데이터 계산 (테이블용)
  const filteredData = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const transactionYear = transactionDate.getFullYear().toString();
    const transactionMonth = (transactionDate.getMonth() + 1).toString().padStart(2, '0');
    
    return (
      transactionYear === selectedYear &&
      transactionMonth === selectedMonth &&
      transaction.amount_in > 0  // 입금액이 0원 초과인 행만 표시
    );
  });

  // 방번호별 입금액 계산
  const calculateRoomAmounts = () => {
    const roomAmounts: Record<number, number> = {};
    
    // 1~15번 방 초기화
    for (let i = 1; i <= 15; i++) {
      roomAmounts[i] = 0;
    }
    
    // 필터링된 거래 데이터에서 방번호별 입금액 합산
    filteredData.forEach(transaction => {
      if (transaction.room !== null && transaction.amount_in > 0) {
        roomAmounts[transaction.room] = (roomAmounts[transaction.room] || 0) + transaction.amount_in;
      }
    });
    
    return roomAmounts;
  };

  // 금액을 한국어 형식으로 포맷팅하는 함수
  const formatAmount = (amount: number | null) => {
    if (amount === null || typeof amount !== 'number' || amount === 0) return '0';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 금액을 한국어 형식으로 포맷팅하는 함수 (0 값은 빈 문자열 반환)
  const formatAmountWithEmpty = (amount: number | null) => {
    if (amount === null || typeof amount !== 'number' || amount === 0) return '';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 숫자 입력 시 천 단위 콤마 추가 함수
  const formatNumberWithCommas = (value: string) => {
    // 입력값에서 모든 콤마 제거
    const plainNumber = value.replace(/,/g, '');
    // 숫자만 남기기
    const numericValue = plainNumber.replace(/[^\d]/g, '');
    
    if (numericValue === '') return '';
    
    // 천 단위 콤마 추가
    return new Intl.NumberFormat('ko-KR').format(parseInt(numericValue));
  };
  
  // 콤마 포함된 문자열에서 숫자만 추출
  const parseFormattedNumber = (formattedValue: string) => {
    const numericValue = formattedValue.replace(/,/g, '');
    return numericValue === '' ? null : parseInt(numericValue);
  };

  // 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 함수
  const formatDate = (dateString: string) => {
    return dateString.split('T')[0];
  };

  // 셀 데이터 업데이트 함수
  const updateCellData = async (id: number, field: string, value: number | null) => {
    try {
      // 로컬 데이터 업데이트
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id ? { ...transaction, [field]: value } : transaction
        )
      );
      
      // 변경된 필드 추적
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    } catch (err: any) {
      alert(`데이터 업데이트 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (id: number, field: string, value: string | number | null) => {
    let numValue: number | null = null;
    
    if (value === null) {
      numValue = null;
    } else if (typeof value === 'string') {
      numValue = value === '' ? null : parseInt(value, 10);
      if (isNaN(Number(numValue)) && numValue !== null) return;
    } else {
      numValue = value;
    }
    
    updateCellData(id, field, numValue);
  };

  // 텍스트 유사도 확인 함수
  const findSimilarCustomer = (memo: string): number | null => {
    if (!memo || !customers.length) return null;
    
    // 메모에서 방 번호 패턴을 찾음
    const roomPatterns = [
      /(\d+)호/,
      /(\d+)번/,
      /(\d+)번방/,
      /(\d+)호실/,
      /(\d+)룸/,
      /room\s*(\d+)/i,
      /^(\d{1,2})$/  // 1-2자리 숫자만 있는 경우
    ];
    
    for (const pattern of roomPatterns) {
      const match = memo.match(pattern);
      if (match && match[1]) {
        const roomNo = parseInt(match[1], 10);
        // 방 번호가 1-15 사이인 경우만 유효하게 처리
        if (roomNo >= 1 && roomNo <= 15) {
          return roomNo;
        }
      }
    }
    
    // 메모에서 불필요한 문자 제거하고 소문자로 변환
    const cleanedMemo = memo.toLowerCase().replace(/[^가-힣a-z0-9]/g, '');
    
    if (!cleanedMemo) return null;
    
    // 가장 유사한 고객 찾기
    let bestMatch: CustomerData | null = null;
    let highestSimilarity = 0;
    
    for (const customer of customers) {
      if (!customer.name) continue;
      
      // 고객 이름도 동일하게 정리
      const cleanedName = customer.name.toLowerCase().replace(/[^가-힣a-z0-9]/g, '');
      
      if (!cleanedName) continue;
      
      // 정확히 포함되는 경우 높은 점수 부여
      if (cleanedMemo.includes(cleanedName) || cleanedName.includes(cleanedMemo)) {
        const similarity = Math.min(cleanedName.length, cleanedMemo.length) / 
                          Math.max(cleanedName.length, cleanedMemo.length);
        
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = customer;
        }
      }
    }
    
    // 유사도가 0.3(30%) 이상인 경우에만 결과 반환
    return highestSimilarity > 0.3 && bestMatch?.room_no !== undefined ? bestMatch.room_no : null;
  };

  // 방번호 입력 핸들러 (1~15 범위 체크)
  const handleRoomInput = (id: number, value: string) => {
    if (value === '') {
      handleInputChange(id, 'room', null);
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    // 1~15 범위 체크
    if (numValue >= 1 && numValue <= 15) {
      handleInputChange(id, 'room', numValue);
    } else {
      alert('방 번호는 1~15 사이의 숫자만 입력 가능합니다.');
    }
  };
  
  // 해당월 입력 핸들러 (1~12 범위 체크)
  const handleMonthInput = (id: number, value: string) => {
    if (value === '') {
      handleInputChange(id, 'real_month', null);
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    // 1~12 범위 체크
    if (numValue >= 1 && numValue <= 12) {
      handleInputChange(id, 'real_month', numValue);
    } else {
      alert('월은 1~12 사이의 숫자만 입력 가능합니다.');
    }
  };

  // 셀 내용 포맷팅
  const formatCellValue = (transaction: WStudioData, key: keyof typeof columnMapping) => {
    if (key === 'date') {
      return formatDate(transaction.date);
    }
    
    // amount_in 필드 처리
    if (key === 'amount_in') {
      return formatAmount(transaction.amount_in);
    }
    
    // 추정 방번호 필드 처리
    if (key === 'estimated_room') {
      const estimatedRoom = findSimilarCustomer(transaction.memo);
      
      return estimatedRoom !== null ? (
        <span 
          className="estimated-room-value" 
          style={{ 
            fontWeight: 500, 
            color: '#3182ce', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => setRoomFromEstimation(transaction.id, estimatedRoom)}
          title="클릭하여 방번호, 해당월, 해당매출 자동 설정"
        >
          {estimatedRoom}
        </span>
      ) : '-';
    }
    
    // real_sales 필드 처리
    if (key === 'real_sales') {
      // 항상 기본값을 설정 (입력값이 있으면 입력값, 없으면 입금액)
      const defaultValue = transaction.real_sales !== null 
        ? transaction.real_sales 
        : transaction.amount_in;
      
      const formattedValue = defaultValue !== null 
        ? formatNumberWithCommas(defaultValue.toString()) 
        : '';
        
      return (
        <input
          type="text"
          value={formattedValue}
          onChange={(e) => {
            const formattedInput = formatNumberWithCommas(e.target.value);
            e.target.value = formattedInput;
            const numericValue = parseFormattedNumber(formattedInput);
            handleInputChange(transaction.id, 'real_sales', numericValue);
          }}
          className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 text-xs"
          style={{ 
            width: '80px', 
            height: '24px', 
            textAlign: 'right'
          }}
        />
      );
    }
    
    // room 필드 처리
    if (key === 'room') {
      // 기본값: 설정되지 않았을 경우 추정 방번호 사용
      const estimatedRoom = findSimilarCustomer(transaction.memo);
      const defaultValue = transaction.room !== null 
        ? transaction.room 
        : estimatedRoom;
      
      return (
        <input
          type="number"
          value={defaultValue !== null ? defaultValue.toString() : ''}
          onChange={(e) => handleRoomInput(transaction.id, e.target.value)}
          className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 text-xs"
          min={1}
          max={15}
          style={{ 
            width: '40px', 
            height: '24px',
            textAlign: 'center'
          }}
        />
      );
    }
    
    // real_month 필드 처리
    if (key === 'real_month') {
      // 기본값: 거래일자의 월 (만약 설정되지 않았다면)
      const transactionDate = new Date(transaction.date);
      const month = transactionDate.getMonth() + 1; // JavaScript 월은 0부터 시작하므로 +1
      const defaultValue = transaction.real_month !== null 
        ? transaction.real_month 
        : month;
      
      return (
        <input
          type="number"
          value={defaultValue !== null ? defaultValue.toString() : ''}
          onChange={(e) => handleMonthInput(transaction.id, e.target.value)}
          className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 text-xs"
          min={1}
          max={12}
          style={{ 
            width: '40px', 
            height: '24px',
            textAlign: 'center'
          }}
        />
      );
    }
    
    // 기타 필드 처리
    return transaction[key] || '-';
  };

  // 추정 방번호를 클릭하면 실제 방번호로 설정하는 함수
  const setRoomFromEstimation = (transactionId: number, roomNo: number | null) => {
    if (roomNo !== null) {
      // 방번호 설정
      updateCellData(transactionId, 'room', roomNo);
      
      // 해당 거래 찾기
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        // 거래일자에서 월 구하기
        const transactionDate = new Date(transaction.date);
        const month = transactionDate.getMonth() + 1;
        
        // 해당월 설정
        updateCellData(transactionId, 'real_month', month);
        
        // 해당매출에 입금액 설정
        updateCellData(transactionId, 'real_sales', transaction.amount_in);
      }
    }
  };

  // 저장 함수
  const saveChanges = async () => {
    if (dirtyFields.size === 0) return true;
    
    try {
      setLoading(true);
      
      // 변경된 거래만 추출
      for (const id of Array.from(dirtyFields)) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) continue;
        
        const result = await updateData('wstudio', 
          { id: transaction.id }, 
          { 
            room: transaction.room,
            real_month: transaction.real_month,
            real_sales: transaction.real_sales
          }
        );
        
        if (!result.success) {
          throw new Error(`거래 ID ${id} 저장 중 오류: ${result.message}`);
        }
      }
      
      // 저장 성공 시 변경 사항 초기화
      setDirtyFields(new Set());
      await fetchTransactions(); // 데이터 다시 로드
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 부모 컴포넌트에 저장 함수 전달
  useEffect(() => {
    if (onSaveFnChange) {
      onSaveFnChange(saveChanges);
    }
  }, [saveChanges, onSaveFnChange]);

  // 방번호별 입금액 표시 개선
  const renderRoomAmounts = () => {
    return (
      <div className="room-amounts-card" style={{ 
        marginBottom: '1.5rem', 
        backgroundColor: '#fff', 
        borderRadius: '0.375rem', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
        padding: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.75rem' }}>스튜디오 매출 요약</div>
        <div style={{ 
          overflowX: 'auto', 
          width: '100%',
          maxWidth: '100%', 
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box'
        }}>
          <table style={{ 
            minWidth: '1000px',
            width: '100%', 
            tableLayout: 'fixed',
            borderCollapse: 'collapse', 
            border: '1px solid #e5e7eb'
          }}>
            <colgroup>
              <col key="col-label" style={{ width: '50px' }} />
              {Array.from({ length: 12 }, (_, i) => (
                <col key={`col-month-${i+1}`} style={{ width: '70px' }} />
              ))}
              <col key="col-total" style={{ width: '80px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', backgroundColor: '#f9fafb' }}>구분</th>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <th key={month} style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', backgroundColor: '#f9fafb' }}>{month}월</th>
                ))}
                <th style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', backgroundColor: '#f9fafb' }}>합계</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((roomNum) => {
                // 해당 방의 월별 매출액 계산
                const monthlyAmounts = Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  // real_month와 room 값에 따라 실제 매출액(real_sales) 찾기
                  const matchingTransactions = transactions.filter(
                    item => item.room === roomNum && item.real_month === month
                  );
                  
                  // 해당 room과 real_month에 맞는 real_sales 값을 합산
                  return matchingTransactions.reduce((sum, item) => sum + (item.real_sales || 0), 0);
                });
                
                // 총 합계 계산
                const totalAmount = monthlyAmounts.reduce((sum, amount) => sum + amount, 0);
                
                // 매출이 없는 방은 붉은색 배경으로 표시
                const hasNoSales = totalAmount === 0;
                const rowStyle = {
                  backgroundColor: hasNoSales ? '#fff1f0' : 'transparent'
                };
                
                return (
                  <tr key={roomNum} style={rowStyle}>
                    <td style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', fontWeight: 500 }}>{roomNum}번</td>
                    {monthlyAmounts.map((amount, index) => (
                      <td key={index} style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'right' }}>
                        {amount > 0 ? formatAmount(amount) : ''}
                      </td>
                    ))}
                    <td style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'right', fontWeight: 500, backgroundColor: totalAmount > 0 ? '#f3f4f6' : '#ffebe9' }}>
                      {totalAmount > 0 ? formatAmount(totalAmount) : '-'}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', fontWeight: 500, backgroundColor: '#f3f4f6' }}>합계</td>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  // real_month 기준으로 각 월의 매출 합산 (real_sales 값 사용)
                  const monthTotal = transactions
                    .filter(item => item.real_month === month && item.real_sales !== null)
                    .reduce((sum, item) => sum + (item.real_sales || 0), 0);
                  
                  return (
                    <td key={month} style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'right', fontWeight: 500, backgroundColor: '#f3f4f6' }}>
                      {monthTotal > 0 ? formatAmount(monthTotal) : ''}
                    </td>
                  );
                })}
                {/* 전체 합계 - real_sales 기준 */}
                <td style={{ border: '1px solid #e5e7eb', padding: '0.375rem 0.5rem', fontSize: '0.75rem', textAlign: 'right', fontWeight: 500, backgroundColor: '#f3f4f6' }}>
                  {formatAmount(transactions
                    .filter(item => item.real_sales !== null)
                    .reduce((sum, item) => sum + (item.real_sales || 0), 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 추가: 로딩 오버레이 컴포넌트
  const LoadingOverlay = () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(0, 0, 0, 0.1)',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
      }}></div>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '100%', padding: '1rem', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}>
      {loading && <LoadingOverlay />}
      
      {error && (
        <div className="error-state" style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#FEF2F2', borderRadius: '0.375rem', color: '#DC2626' }}>
          에러: {error}
        </div>
      )}
      
      <div className="date-filters" style={{ width: '100%', boxSizing: 'border-box', marginBottom: '1rem' }}>
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
      
      {/* 방번호별 입금액 카드 - 항상 표시 */}
      {renderRoomAmounts()}

      <div className="data-table-container" style={{ width: '100%', boxSizing: 'border-box' }}>
        <table className="data-table">
          <thead>
            <tr>
              {Object.entries(columnMapping).map(([key, label]) => (
                <th key={key} className={columnStyles[key as keyof typeof columnStyles]} style={{ paddingRight: '16px' }}>
                  {label}
                </th>
              ))}
              {/* 여백을 위한 빈 열 추가 */}
              <th style={{ width: '20px', border: 'none', backgroundColor: 'transparent' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(columnMapping).length + 1} className="empty-state">
                  등록된 거래 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredData.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key} className={columnStyles[key as keyof typeof columnStyles]} style={{ paddingRight: '16px' }}>
                      {formatCellValue(transaction, key as keyof typeof columnMapping)}
                    </td>
                  ))}
                  {/* 여백을 위한 빈 셀 추가 */}
                  <td style={{ width: '20px', border: 'none' }}></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 