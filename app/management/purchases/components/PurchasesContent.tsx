'use client';

import { useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

interface PurchaseData {
  id: number;
  store_id: number;
  vendor_id: number;
  purchase_date: string;
  amount: number;
  created_at: string;
  updated_at: string;
  store_name: string;
  vendor_name: string;
}

interface RawPurchaseData {
  id: number;
  store_id: number;
  vendor_id: number;
  purchase_date: string;
  amount: number;
  created_at: string;
  updated_at: string;
  stores: {
    store_name: string;
  };
  vendors: {
    vendor_name: string;
  };
}

interface VendorData {
  id: number;
  vendor_name: string;
  store_id: number;
  order: number;
  bank_account: string | null;
}

const columnMapping = {
  store_name: '점포명',
  vendor_name: '거래처명',
  purchase_date: '매입일자',
  amount: '매입금액',
  actions: '관리'
} as const;

const columnStyles = {
  store_name: 'col-name text-center min-w-[100px] max-w-[150px]',
  vendor_name: 'col-name text-center min-w-[100px] max-w-[150px]',
  purchase_date: 'col-date text-center min-w-[100px] max-w-[150px]',
  amount: 'col-number text-right min-w-[100px] max-w-[150px]',
  actions: 'col-actions text-center min-w-[100px] max-w-[150px]'
} as const;

// 컴포넌트 Props 인터페이스 추가
interface PurchasesContentProps {
  onSaveFnChange?: (fn: () => Promise<boolean | void>) => void;
  isSaving?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
  onOpenModalFnChange?: (fn: () => void) => void;
}

export default function PurchasesContent({ 
  onSaveFnChange, 
  isSaving,
  onLoadingChange,
  onErrorChange,
  onHasChangesChange,
  onOpenModalFnChange
}: PurchasesContentProps) {
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [availableStores, setAvailableStores] = useState<{store_id: number; store_name: string}[]>([]);
  const [allStoresSelected, setAllStoresSelected] = useState(true);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [filteredPurchasesByDate, setFilteredPurchasesByDate] = useState<PurchaseData[]>([]);
  const [filteredPurchasesForTable, setFilteredPurchasesForTable] = useState<PurchaseData[]>([]);
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastInputInfo, setLastInputInfo] = useState({
    store_id: '',
    vendor_id: ''
  });
  const [newPurchase, setNewPurchase] = useState({
    store_id: '',
    vendor_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    amount: '0'
  });

  // 수정 모달용 상태 추가
  const [selectedItem, setSelectedItem] = useState<PurchaseData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState({
    id: 0,
    store_id: '',
    vendor_id: '',
    purchase_date: '',
    amount: ''
  });

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
      // 모든 요청을 병렬로 실행
      const [storesPromise, vendorsPromise, purchasesPromise] = [
        supabase
          .from('stores')
          .select('store_id, store_name')
          .not('store_name', 'eq', '위시크래프터')
          .order('store_id'),
          
        supabase
          .from('vendors')
          .select('id, vendor_name, store_id, order, bank_account')
          .eq('category', '매입')
          .order('order', { ascending: true }),
          
        supabase
          .from('purchases')
          .select(`
            id,
            store_id,
            vendor_id,
            purchase_date,
            amount,
            created_at,
            updated_at,
            stores (store_name),
            vendors (vendor_name)
          `)
          .order('purchase_date', { ascending: false })
      ];
      
      const [storesResult, vendorsResult, purchasesResult] = await Promise.all([
        storesPromise, vendorsPromise, purchasesPromise
      ]);
      
      // 오류 처리
      if (storesResult.error) throw storesResult.error;
      if (vendorsResult.error) throw vendorsResult.error;
      if (purchasesResult.error) throw purchasesResult.error;
      
      // 데이터 일괄 업데이트를 위한 임시 값
      const newStores = storesResult.data || [];
      const newVendors = vendorsResult.data || [];
      
      // 매입 데이터 처리
      const formattedData: PurchaseData[] = (purchasesResult.data as unknown as RawPurchaseData[]).map(item => ({
        id: item.id,
        store_id: item.store_id,
        vendor_id: item.vendor_id,
        purchase_date: item.purchase_date,
        amount: item.amount,
        created_at: item.created_at,
        updated_at: item.updated_at,
        store_name: item.stores.store_name,
        vendor_name: item.vendors.vendor_name
      }));
      
      // 상태 업데이트를 일괄 처리
      setAvailableStores(newStores);
      setSelectedStores(new Set(newStores.map(store => store.store_name)));
      setVendors(newVendors);
      setPurchases(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 연도/월 변경 시 데이터 다시 가져오기
  const fetchPurchases = async () => {
    // 기존 데이터가 있으면 로딩 상태만 표시하고 전체 화면을 가리지 않음
    if (purchases.length > 0) {
      setLoading(true);
      try {
        await fetchAllData();
      } catch (e) {
        console.error("데이터 새로고침 오류:", e);
      }
    } else {
      await fetchAllData();
    }
  };

  useEffect(() => {
    // 초기 로딩
    if (purchases.length === 0) {
      fetchAllData();
    } else {
      // 필터 변경 시 기존 데이터 기반 필터링
      fetchPurchases();
    }
  }, [selectedYear, selectedMonth]);

  // 필터링된 데이터 재계산 로직 추가
  useEffect(() => {
    if (!purchases.length) return;
    
    // 연도와 월로 필터링
    const byDate = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchase_date);
      const purchaseYear = purchaseDate.getFullYear().toString();
      const purchaseMonth = (purchaseDate.getMonth() + 1).toString().padStart(2, '0');
      
      return purchaseYear === selectedYear && purchaseMonth === selectedMonth;
    });
    
    setFilteredPurchasesByDate(byDate);
    
    // 점포까지 함께 필터링
    const forTable = byDate.filter(purchase => 
      selectedStores.has(purchase.store_name)
    );
    
    setFilteredPurchasesForTable(forTable);
  }, [purchases, selectedYear, selectedMonth, selectedStores]);

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

  // 수정 버튼 클릭 시 호출
  const handleEditClick = (purchase: PurchaseData) => {
    setSelectedItem(purchase);
    setEditingPurchase({
      id: purchase.id,
      store_id: purchase.store_id.toString(),
      vendor_id: purchase.vendor_id.toString(),
      purchase_date: purchase.purchase_date,
      amount: purchase.amount.toLocaleString()
    });
    setIsEditModalOpen(true);
  };

  // 삭제 버튼 클릭 시 호출
  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('정말로 이 매입 내역을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 성공적으로 삭제 후 데이터 새로고침
      await fetchAllData();
      alert('매입 내역이 삭제되었습니다.');
    } catch (err: any) {
      setError(err.message);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 수정 폼 제출 처리
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('purchases')
        .update({
          store_id: parseInt(editingPurchase.store_id),
          vendor_id: parseInt(editingPurchase.vendor_id),
          purchase_date: editingPurchase.purchase_date,
          amount: parseInt(editingPurchase.amount.replace(/,/g, '')),
        })
        .eq('id', editingPurchase.id);

      if (error) throw error;

      // 성공적으로 업데이트 후 데이터 새로고침
      await fetchAllData();
      setIsEditModalOpen(false);
      alert('매입 내역이 수정되었습니다.');
    } catch (err: any) {
      console.error('Error updating purchase entry:', err);
      setError(err.message);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 금액 입력 시 자동 콤마 추가 (수정 모달용)
  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setEditingPurchase({
      ...editingPurchase,
      amount: value ? parseInt(value).toLocaleString() : ''
    });
  };

  // 특정 키의 값을 가져오는 함수
  const getValue = (purchase: PurchaseData, key: keyof typeof columnMapping): string | ReactNode => {
    if (key === 'purchase_date') {
      return formatDate(purchase[key]);
    }
    if (key === 'amount') {
      return formatAmount(purchase[key]);
    }
    if (key === 'actions') {
      return (
        <div className="action-buttons">
          <button 
            className="btn btn-sm btn-edit"
            onClick={() => handleEditClick(purchase)}
          >
            수정
          </button>
          <button 
            className="btn btn-sm btn-delete"
            onClick={() => handleDeleteClick(purchase.id)}
          >
            삭제
          </button>
        </div>
      );
    }
    return purchase[key]?.toString() || '-';
  };

  // 점포별 거래처 매입금액 계산
  const calculateStoreVendorTotals = (store: {store_id: number; store_name: string}) => {
    const storeData = filteredPurchasesByDate.filter(p => p.store_name === store.store_name);
    const vendorTotals = new Map<string, number>();

    // 해당 점포의 거래처만 필터링
    const storeVendors = vendors.filter(v => v.store_id === store.store_id);

    // 해당 점포의 거래처에 대해 초기값 0으로 설정
    storeVendors.forEach(vendor => {
      vendorTotals.set(vendor.vendor_name, 0);
    });

    // 실제 거래 데이터로 업데이트
    storeData.forEach(purchase => {
      const key = purchase.vendor_name;
      if (vendorTotals.has(key)) { // 해당 점포의 거래처인 경우에만 업데이트
        vendorTotals.set(key, (vendorTotals.get(key) || 0) + purchase.amount);
      }
    });

    return vendorTotals;
  };

  // 점포별 거래처 목록 가져오기
  const getStoreVendors = (store: {store_id: number; store_name: string}) => {
    return vendors
      .filter(v => v.store_id === store.store_id)
      .sort((a, b) => a.order - b.order);
  };

  // 매입 등록 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([{
          store_id: parseInt(newPurchase.store_id),
          vendor_id: parseInt(newPurchase.vendor_id),
          purchase_date: newPurchase.purchase_date,
          amount: parseInt(newPurchase.amount.replace(/,/g, '')),
        }]);

      if (error) throw error;

      // 직전 입력 정보 저장
      setLastInputInfo({
        store_id: newPurchase.store_id,
        vendor_id: newPurchase.vendor_id
      });

      // 성공적으로 등록 후 데이터 새로고침
      await fetchAllData();
      setIsModalOpen(false);
      
      // 새로운 입력을 위한 초기화 (이전 점포/거래처 정보 유지)
      setNewPurchase({
        store_id: newPurchase.store_id,
        vendor_id: newPurchase.vendor_id,
        purchase_date: new Date().toISOString().split('T')[0],
        amount: '0'
      });
    } catch (err: any) {
      console.error('Error inserting purchase:', err);
      setError(err.message);
    }
  };

  // 모달 열기 함수를 메모이제이션
  const handleOpenModal = useCallback(() => {
    setNewPurchase({
      store_id: lastInputInfo.store_id,
      vendor_id: lastInputInfo.vendor_id,
      purchase_date: new Date().toISOString().split('T')[0],
      amount: '0'
    });
    setIsModalOpen(true);
  }, [lastInputInfo]);

  // 금액 입력 시 자동 콤마 추가
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setNewPurchase({
      ...newPurchase,
      amount: value ? parseInt(value).toLocaleString() : ''
    });
  };

  // 부모 컴포넌트에 로딩 상태 변경 알림
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // 부모 컴포넌트에 에러 상태 변경 알림
  useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  // 부모 컴포넌트에 변경 상태 알림
  useEffect(() => {
    onHasChangesChange?.(hasChanges);
  }, [hasChanges, onHasChangesChange]);

  // 저장 함수를 부모 컴포넌트에 전달
  useEffect(() => {
    if (onSaveFnChange) {
      onSaveFnChange(savePurchases);
    }
  }, [onSaveFnChange]);

  // 저장 함수 구현
  const savePurchases = async (): Promise<boolean> => {
    try {
      // 현재 상태에서는 실제로 변경할 내용이 없으므로 성공으로 간주
      // 필요한 경우 여기에 실제 저장 로직을 구현
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // 모달 열기 함수를 부모 컴포넌트에 전달
  useEffect(() => {
    if (onOpenModalFnChange) {
      onOpenModalFnChange(handleOpenModal);
    }
  }, [onOpenModalFnChange, handleOpenModal]);

  if (loading && purchases.length === 0) {
    return (
      <div className="purchases-content">
        <div className="minimal-loading-state">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchases-content">
        <div className="error-state">
          에러: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="purchases-content">
      {loading && purchases.length > 0 && (
        <div className="minimal-loading-indicator">
          <div className="loading-spinner-small"></div>
        </div>
      )}

      <div className="page-header">
        {/* 매입 등록 버튼 제거 - 이제 상단 우측에 표시됨 */}
      </div>

      {/* 매입 등록 모달 */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>매입 등록</h2>
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
                    value={newPurchase.store_id}
                    onChange={(e) => setNewPurchase({...newPurchase, store_id: e.target.value})}
                    required
                  >
                    <option value="">선택하세요</option>
                    {availableStores
                      .filter(store => [1001, 1003, 1004, 1005, 1100].includes(store.store_id))
                      .map(store => (
                        <option key={store.store_id} value={store.store_id}>
                          {store.store_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>거래처명</label>
                  <select
                    value={newPurchase.vendor_id}
                    onChange={(e) => setNewPurchase({...newPurchase, vendor_id: e.target.value})}
                    required
                  >
                    <option value="">선택하세요</option>
                    {vendors
                      .filter(vendor => !newPurchase.store_id || vendor.store_id === parseInt(newPurchase.store_id))
                      .map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.vendor_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>매입일자</label>
                  <input
                    type="date"
                    value={newPurchase.purchase_date}
                    onChange={(e) => setNewPurchase({...newPurchase, purchase_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>매입금액</label>
                  <input
                    type="text"
                    value={newPurchase.amount}
                    onChange={handleAmountChange}
                    placeholder="0"
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
        <h2 className="summary-title">점포별 매입현황</h2>
        <div className="summary-grid">
          {/* 점포별 매입현황 */}
          {availableStores
            .filter(store => ![2001].includes(store.store_id)) // 2001 제외
            .map(store => {
            const storeVendorTotals = calculateStoreVendorTotals(store);
            const total = Array.from(storeVendorTotals.values()).reduce((sum, amount) => sum + amount, 0);
            const storeVendors = getStoreVendors(store);
            
            return (
              <div key={store.store_id} className="store-total-card hoverable-card">
                <div className="store-name">{store.store_name}</div>
                <div className="store-details">
                  <div className="amount-row">
                    <span className="amount-label">총매입</span>
                    <span className="amount-value">{formatAmount(total)}원</span>
                  </div>
                  {storeVendors.map(vendor => {
                    const amount = storeVendorTotals.get(vendor.vendor_name) || 0;
                    return (
                      <div key={vendor.id} className="amount-row vendor">
                        <span className="amount-label">{vendor.vendor_name}</span>
                        <span className="amount-value">{formatAmount(amount)}원</span>
                        {vendor.bank_account && (
                          <span className="bank-account-container">
                            {vendor.bank_account}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className="amount-row transactions">
                    <span className="amount-label">거래건수</span>
                    <span className="amount-value">
                      {filteredPurchasesByDate.filter(p => p.store_name === store.store_name).length}건
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
            {filteredPurchasesForTable.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(columnMapping).length} className="empty-state">
                  등록된 매입 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filteredPurchasesForTable.map((purchase) => (
                <tr key={purchase.id}>
                  {Object.keys(columnMapping).map((key) => (
                    <td key={key} className={columnStyles[key as keyof typeof columnStyles]}>
                      {getValue(purchase, key as keyof typeof columnMapping)}
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
              <h2>매입 내역 수정</h2>
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
                    value={editingPurchase.store_id}
                    onChange={(e) => setEditingPurchase({...editingPurchase, store_id: e.target.value})}
                    required
                  >
                    <option value="">선택하세요</option>
                    {availableStores
                      .filter(store => [1001, 1003, 1004, 1005, 1100].includes(store.store_id))
                      .map(store => (
                        <option key={store.store_id} value={store.store_id}>
                          {store.store_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>거래처명</label>
                  <select
                    value={editingPurchase.vendor_id}
                    onChange={(e) => setEditingPurchase({...editingPurchase, vendor_id: e.target.value})}
                    required
                  >
                    <option value="">선택하세요</option>
                    {vendors
                      .filter(vendor => !editingPurchase.store_id || vendor.store_id === parseInt(editingPurchase.store_id))
                      .map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.vendor_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>매입일자</label>
                  <input
                    type="date"
                    value={editingPurchase.purchase_date}
                    onChange={(e) => setEditingPurchase({...editingPurchase, purchase_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>매입금액</label>
                  <input
                    type="text"
                    value={editingPurchase.amount}
                    onChange={handleEditAmountChange}
                    placeholder="0"
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