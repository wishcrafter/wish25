'use client';

import { useEffect, useState, ReactNode, useCallback } from 'react';
import { fetchData, insertData, updateData, deleteData } from '../../../../utils/supabase-client-api';

interface OtherData {
  id: number;
  store_id: number;
  date: string;
  amount: number;
  details: string;
  created_at: string;
  updated_at: string;
  store_name: string;
}

const columnMapping = {
  store_name: '점포명',
  details: '상세내용',
  date: '거래일자',
  amount: '거래금액',
  actions: '관리'
} as const;

const columnStyles = {
  store_name: 'col-name text-center min-w-[100px] max-w-[150px]',
  details: 'col-text text-center min-w-[100px] max-w-[150px]',
  date: 'col-date text-center min-w-[100px] max-w-[150px]',
  amount: 'col-number text-right min-w-[100px] max-w-[150px]',
  actions: 'col-actions text-center min-w-[100px] max-w-[150px]'
} as const;

// 컴포넌트 Props 인터페이스 추가
interface OthersContentProps {
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
  onOpenModalFnChange?: (fn: () => void) => void;
}

export default function OthersContent({
  onLoadingChange,
  onErrorChange,
  onOpenModalFnChange
}: OthersContentProps) {
  const [others, setOthers] = useState<OtherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [availableStores, setAvailableStores] = useState<{store_id: number; store_name: string}[]>([]);
  const [allStoresSelected, setAllStoresSelected] = useState(true);
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastInputInfo, setLastInputInfo] = useState({
    store_id: ''
  });
  const [newOther, setNewOther] = useState({
    store_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '0',
    details: ''
  });

  // 수정 모달용 상태 추가
  const [selectedItem, setSelectedItem] = useState<OtherData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 수정 버튼 클릭 시 호출
  const handleEditClick = (other: OtherData) => {
    setSelectedItem(other);
    setEditingOther({
      id: other.id,
      store_id: other.store_id.toString(),
      date: other.date,
      amount: other.amount.toLocaleString(),
      details: other.details || ''
    });
    setIsEditModalOpen(true);
  };

  // 삭제 버튼 클릭 시 호출
  const handleDeleteClick = async (id: number) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      setLoading(true);
      try {
        console.log(`[OTHERS] 거래 내역 삭제 시작: ID=${id}`);
        const response = await deleteData('others', { id });

        if (!response.success) {
          throw new Error('거래 내역 삭제 실패');
        }

        // 성공적으로 삭제 후 데이터 새로고침
        await fetchOthers();
        alert('거래 내역이 삭제되었습니다.');
      } catch (err: any) {
        console.error('[OTHERS] 거래 내역 삭제 오류:', err);
        setError(err.message);
        alert('삭제 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 수정 폼 제출 처리
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log(`[OTHERS] 거래 내역 수정 시작: ID=${editingOther.id}`);
      const response = await updateData('others', 
        { id: editingOther.id },
        {
          store_id: parseInt(editingOther.store_id),
          date: editingOther.date,
          amount: parseInt(editingOther.amount.replace(/,/g, '')),
          details: editingOther.details
        }
      );

      if (!response.success) {
        throw new Error('거래 내역 수정 실패');
      }

      // 성공적으로 업데이트 후 데이터 새로고침
      await fetchOthers();
      setIsEditModalOpen(false);
      alert('거래 내역이 수정되었습니다.');
    } catch (err: any) {
      console.error('[OTHERS] 거래 내역 수정 오류:', err);
      setError(err.message);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 금액 입력 시 자동 콤마 추가 (수정 모달용)
  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setEditingOther({
      ...editingOther,
      amount: value ? parseInt(value).toLocaleString() : ''
    });
  };

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
      console.log('[OTHERS] 점포 목록 로딩 시작');
      const response = await fetchData('stores', {
        select: 'store_id, store_name',
        orderBy: 'store_id'
      });

      if (!response.success) {
        throw new Error('점포 데이터 로딩 실패');
      }

      console.log(`[OTHERS] 점포 목록 로딩 완료: ${response.data?.length || 0}개 점포`);
      setAvailableStores(response.data);
      setSelectedStores(new Set(response.data.map((store: {store_id: number, store_name: string}) => store.store_name)));
    } catch (err: any) {
      console.error('[OTHERS] 점포 목록 로딩 오류:', err);
      setError(err.message);
    }
  };

  // 기타 데이터를 가져오는 함수
  const fetchOthers = async () => {
    try {
      setLoading(true);
      console.log('[OTHERS] 기타 거래 데이터 로딩 시작');
      
      // 두 개의 개별 쿼리를 병렬로 실행
      const [othersResponse, storesResponse] = await Promise.all([
        fetchData('others', {
          select: 'id, store_id, date, amount, details',
          orderBy: 'date',
          ascending: false
        }),
        fetchData('stores', {
          select: 'store_id, store_name'
        })
      ]);

      if (!othersResponse.success) {
        throw new Error('기타 거래 데이터 로딩 실패');
      }
      if (!storesResponse.success) {
        throw new Error('점포 데이터 로딩 실패');
      }

      console.log(`[OTHERS] 데이터 로딩 완료: ${othersResponse.data?.length || 0}개 거래, ${storesResponse.data?.length || 0}개 점포`);

      // 점포 ID를 키로, 점포명을 값으로 하는 맵 생성
      const storeMap = new Map();
      storesResponse.data.forEach((store: { store_id: number, store_name: string }) => {
        storeMap.set(store.store_id, store.store_name);
      });

      console.log('[OTHERS] othersResponse', othersResponse);
      // 데이터 형식 변환 - 기존 데이터와 새 데이터 병합하여 불필요한 리렌더링 방지
      const formattedData: OtherData[] = ((othersResponse.data || othersResponse || []) as any[]).map((item: any) => ({
        id: item.id,
        store_id: item.store_id,
        date: item.date,
        amount: item.amount,
        details: item.details,
        created_at: item.created_at,
        updated_at: item.updated_at,
        store_name: storeMap.get(item.store_id) || '알 수 없음'
      }));

      // 로컬 상태 업데이트
      setOthers(formattedData);
      
      // 로딩 상태 해제
      setLoading(false);
      
      // 부모 컴포넌트에 상태 변경 알림
      if (onLoadingChange) {
        onLoadingChange(false);
      }
      if (onErrorChange) {
        onErrorChange(null);
      }
      
      return true;
    } catch (err: any) {
      console.error('[OTHERS] 데이터 로딩 오류:', err);
      setError(err.message);
      setLoading(false);
      
      // 부모 컴포넌트에 상태 변경 알림
      if (onLoadingChange) {
        onLoadingChange(false);
      }
      if (onErrorChange) {
        onErrorChange(err.message);
      }
      
      return false;
    }
  };

  // useEffect: 점포 먼저, 그 다음 기타 거래
  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (availableStores.length > 0) {
      fetchOthers();
    }
  }, [availableStores]);

  // 필터링된 데이터 계산 (기타현황용)
  const filteredOthersByDate = others.filter(other => {
    const otherDate = new Date(other.date);
    const otherYear = otherDate.getFullYear().toString();
    const otherMonth = (otherDate.getMonth() + 1).toString().padStart(2, '0');
    return (
      otherYear === selectedYear &&
      otherMonth === selectedMonth
    );
  });

  // 필터링된 데이터 계산 (테이블 표시용)
  const filteredOthersForTable = others.filter(other => {
    const otherDate = new Date(other.date);
    const otherYear = otherDate.getFullYear().toString();
    const otherMonth = (otherDate.getMonth() + 1).toString().padStart(2, '0');
    // store_id 기준으로 availableStores에서 store_name을 찾아 selectedStores에 포함되는지 확인
    const store = availableStores.find(s => s.store_id === other.store_id);
    return (
      otherYear === selectedYear &&
      otherMonth === selectedMonth &&
      store && selectedStores.has(store.store_name)
    );
  });

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

  // 특정 키의 값을 가져오는 함수 (actions 컬럼 추가)
  const getValue = (other: OtherData, key: keyof typeof columnMapping): string | ReactNode => {
    if (key === 'date') {
      return formatDate(other[key]);
    }
    if (key === 'amount') {
      return formatAmount(other[key]);
    }
    if (key === 'actions') {
      return (
        <div className="action-buttons">
          <button 
            className="btn btn-sm btn-edit"
            onClick={() => handleEditClick(other)}
          >
            수정
          </button>
          <button 
            className="btn btn-sm btn-delete"
            onClick={() => handleDeleteClick(other.id)}
          >
            삭제
          </button>
        </div>
      );
    }
    return other[key]?.toString() || '-';
  };

  // 점포별 총 금액 계산
  const calculateStoreTotals = (store: {store_id: number; store_name: string}) => {
    const storeData = filteredOthersByDate.filter(p => p.store_id === store.store_id);
    const total = storeData.reduce((sum, item) => sum + item.amount, 0);
    const count = storeData.length;
    return { total, count };
  };

  // 새 항목 추가 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 입력값 검증
      if (!newOther.store_id || !newOther.date || !newOther.amount) {
        throw new Error('모든 필수 항목을 입력해주세요.');
      }
      
      // 금액에서 콤마 제거 후 숫자로 변환
      const amountValue = parseInt(newOther.amount.replace(/,/g, ''));
      if (isNaN(amountValue)) {
        throw new Error('금액을 올바르게 입력해주세요.');
      }
      
      console.log('[OTHERS] 새 거래 내역 추가 시작');
      const response = await insertData('others', {
        store_id: parseInt(newOther.store_id),
        date: newOther.date,
        amount: amountValue,
        details: newOther.details
      });
      
      if (!response.success) {
        throw new Error('거래 내역 추가 실패');
      }
      
      // 성공적으로 추가 후 데이터 새로고침
      await fetchOthers();
      
      // 입력 폼 초기화 및 모달 닫기
      setNewOther({
        store_id: newOther.store_id, // 마지막 선택한 점포는 유지
        date: new Date().toISOString().split('T')[0],
        amount: '0',
        details: ''
      });
      
      // 마지막 입력 정보 저장 (다음 입력 시 편의성 제공)
      setLastInputInfo({
        store_id: newOther.store_id
      });
      
      setIsModalOpen(false);
      
      alert('새 거래 내역이 추가되었습니다.');
    } catch (err: any) {
      console.error('[OTHERS] 거래 내역 추가 오류:', err);
      setError(err.message);
      alert(`추가 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 모달 열기
  const handleOpenModal = useCallback(() => {
    setNewOther({
      store_id: lastInputInfo.store_id,
      date: new Date().toISOString().split('T')[0],
      amount: '0',
      details: ''
    });
    setIsModalOpen(true);
  }, [lastInputInfo.store_id]);

  // 금액 입력 시 자동 콤마 추가
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setNewOther({
      ...newOther,
      amount: value ? parseInt(value).toLocaleString() : ''
    });
  };

  // 수정 모달용 상태 추가
  const [editingOther, setEditingOther] = useState({
    id: 0,
    store_id: '',
    date: '',
    amount: '',
    details: ''
  });

  // 모달 열기 함수를 부모 컴포넌트에 전달
  useEffect(() => {
    if (onOpenModalFnChange) {
      onOpenModalFnChange(handleOpenModal);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOpenModalFnChange]);

  // 부모 컴포넌트에 로딩 상태 전달
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // 부모 컴포넌트에 에러 상태 전달
  useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  if (loading && others.length === 0) {
    // 초기 로딩 시에만 페이지 전체 로딩 표시
    // 데이터가 이미 있는 경우에는 데이터를 표시하면서 새로고침 진행
    return null;
  }

  if (error) {
    // 에러 상태에서도 UI를 표시
    return null;
  }

  return (
    <div className="page-container">
      {loading && (
        <div className="minimal-loading-indicator">
          <div className="loading-spinner-small"></div>
        </div>
      )}
      
      {/* 기타 거래 등록 모달 */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>기타 거래 등록</h2>
              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>점포명</label>
                  <select
                    value={newOther.store_id}
                    onChange={(e) => setNewOther({...newOther, store_id: e.target.value})}
                    required
                  >
                    <option value="">선택하세요</option>
                    {availableStores
                      .map(store => (
                        <option key={store.store_id} value={store.store_id}>
                          {store.store_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>거래일자</label>
                  <input
                    type="date"
                    value={newOther.date}
                    onChange={(e) => setNewOther({...newOther, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>거래금액</label>
                  <input
                    type="text"
                    value={newOther.amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>상세내용</label>
                  <input
                    type="text"
                    value={newOther.details}
                    onChange={(e) => setNewOther({...newOther, details: e.target.value})}
                    placeholder="상세내용을 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        <h2 className="summary-title">점포별 기타거래 현황</h2>
        {/* 모든 점포에 대해 카드 생성 (거래가 없어도 카드가 보이도록) */}
        <div className="summary-grid">
          {availableStores
            .map(store => {
              const { total, count } = calculateStoreTotals(store);
              return (
                <div key={store.store_id} className="store-total-card small-card">
                  <div className="store-name">{store.store_name}</div>
                  <div className="store-details">
                    <div className="amount-row">
                      <span className="amount-label">총 거래금액</span>
                      <span className="amount-value">{formatAmount(total)}원</span>
                    </div>
                    <div className="amount-row transactions">
                      <span className="amount-label">거래건수</span>
                      <span className="amount-value">
                        {count}건
                      </span>
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
            <label key={store.store_id} className="checkbox-wrapper">
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
            {filteredOthersForTable.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(columnMapping).length} className="empty-state">
                  등록된 기타 거래 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filteredOthersForTable.map((other) => (
                <tr key={other.id}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key} className={columnStyles[key as keyof typeof columnStyles]}>
                      {getValue(other, key as keyof typeof columnMapping)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 수정 모달 추가 */}
      {isEditModalOpen && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>기타 거래 수정</h2>
              <button
                className="modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>점포명</label>
                  <select
                    value={editingOther.store_id}
                    onChange={(e) => setEditingOther({...editingOther, store_id: e.target.value})}
                    required
                  >
                    <option value="">선택하세요</option>
                    {availableStores
                      .map(store => (
                        <option key={store.store_id} value={store.store_id}>
                          {store.store_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>거래일자</label>
                  <input
                    type="date"
                    value={editingOther.date}
                    onChange={(e) => setEditingOther({...editingOther, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>거래금액</label>
                  <input
                    type="text"
                    value={editingOther.amount}
                    onChange={handleEditAmountChange}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>상세내용</label>
                  <input
                    type="text"
                    value={editingOther.details}
                    onChange={(e) => setEditingOther({...editingOther, details: e.target.value})}
                    placeholder="상세내용을 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 