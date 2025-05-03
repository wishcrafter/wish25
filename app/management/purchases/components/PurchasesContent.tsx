// sales 페이지 전체 코드를 purchases 페이지에 복사, fetchData, 컬럼명, 필터링만 매입 기준으로 변경
'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { fetchData, insertData, updateData, deleteData } from '../../../../utils/supabase-client-api';
import Link from 'next/link';

interface PurchaseData {
  purchase_id: number;
  store_name: string;
  purchase_date: string;
  amount: number;
  vendor_name: string;
  store_id?: number;
  vendor_id?: number;
}

interface RawPurchaseData {
  store_id: number;
  purchase_date: string;
  amount: number;
  vendors: { vendor_name: string };
  stores: { store_name: string };
}

interface Store {
  store_id: number;
  store_name: string;
}

interface StoreSummary {
  total: number;
  transactions: number;
}

const columnMapping = {
  store_name: '점포명',
  purchase_date: '매입일자',
  vendor_name: '거래처명',
  amount: '매입금액',
  actions: '관리',
} as const;

const columnStyles = {
  store_name: 'col-name text-center min-w-[100px] max-w-[120px]',
  purchase_date: 'col-date text-center min-w-[100px] max-w-[120px]',
  vendor_name: 'col-name text-center min-w-[100px] max-w-[120px]',
  amount: 'col-number text-right min-w-[100px] max-w-[120px]',
  actions: 'col-actions text-center min-w-[100px] max-w-[120px]',
} as const;

const ALLOWED_STORE_IDS = [1001, 1003, 1004, 1005, 1100, 3001];

const PurchasesContent = forwardRef((_props, ref) => {
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [availableStores, setAvailableStores] = useState<Store[]>([]);
  const [allStoresSelected, setAllStoresSelected] = useState(true);
  const [filteredPurchasesByDate, setFilteredPurchasesByDate] = useState<PurchaseData[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseData[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'register' | 'edit' | null>(null);
  const [editData, setEditData] = useState<PurchaseData | null>(null);
  const [form, setForm] = useState({
    store_id: '',
    vendor_id: '',
    purchase_date: '',
    amount: '',
  });
  const [modalError, setModalError] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const storesPromise = fetchData('stores', {
        select: 'store_id, store_name',
        filters: { not: { 'store_name': ['위시크래프터', '더블유 스튜디오'] } },
        orderBy: 'store_id'
      });
      const purchasesPromise = fetchData('purchases', {
        select: `store_id, purchase_date, amount, vendors (vendor_name), stores (store_name)`,
        orderBy: 'purchase_date',
        ascending: false
      });
      const vendorsPromise = fetchData('vendors', {
        select: 'id, vendor_name, store_id, category, bank_account, business_number, sort_order',
        filters: { eq: { category: '매입' } },
        orderBy: 'store_id'
      });
      const [storesResponse, purchasesResponse, vendorsResponse] = await Promise.all([storesPromise, purchasesPromise, vendorsPromise]);
      if (!storesResponse.success) throw new Error('점포 데이터 로딩 실패');
      if (!purchasesResponse.success) throw new Error('매입 데이터 로딩 실패');
      if (!vendorsResponse.success) throw new Error('거래처 데이터 로딩 실패');
      const storesResult = storesResponse.data || [];
      const purchasesResult = purchasesResponse.data || [];
      setAvailableStores(storesResult);
      setSelectedStores(new Set(storesResult.map((store: Store) => store.store_name)));
      const formattedData: PurchaseData[] = purchasesResult.map((item: RawPurchaseData) => ({
        purchase_id: item.store_id,
        store_name: item.stores.store_name,
        purchase_date: item.purchase_date,
        vendor_name: item.vendors?.vendor_name || '-',
        amount: item.amount,
      }));
      setPurchases(formattedData);
      setVendors(vendorsResponse.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    if (!purchases.length) return;
    const byDate = purchases.filter(purchase => {
      const date = new Date(purchase.purchase_date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return year === selectedYear && month === selectedMonth;
    });
    setFilteredPurchasesByDate(byDate);
    const byStores = byDate.filter(purchase => selectedStores.has(purchase.store_name));
    setFilteredPurchases(byStores);
  }, [purchases, selectedYear, selectedMonth, selectedStores]);

  const toggleAllStores = () => {
    if (allStoresSelected) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(availableStores.map(store => store.store_name)));
    }
    setAllStoresSelected(!allStoresSelected);
  };
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
  const formatAmount = (amount: number | null) => {
    if (amount === null || typeof amount !== 'number') return '0';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };
  const formatDate = (dateString: string) => {
    return dateString.split('T')[0];
  };
  const formatCellValue = (purchase: PurchaseData, key: keyof PurchaseData | 'actions') => {
    if (key === 'purchase_date') return formatDate(purchase[key]);
    if (key === 'amount') return formatAmount(purchase[key] as number) + '원';
    return purchase[key as keyof PurchaseData]?.toString() || '-';
  };
  const calculateStoreTotal = (storeName: string) => {
    const storeData = filteredPurchasesByDate.filter(p => p.store_name === storeName);
    return {
      total: storeData.reduce((sum, p) => sum + (p.amount || 0), 0),
      transactions: storeData.length
    };
  };
  const getStoreVendors = (storeId: number) => {
    return vendors.filter(v => v.store_id === storeId);
  };

  const openRegisterModal = () => {
    setForm({ store_id: '', vendor_id: '', purchase_date: '', amount: '' });
    setEditData(null);
    setModalType('register');
    setShowModal(true);
    setModalError('');
  };
  const openEditModal = (purchase: PurchaseData) => {
    const store = availableStores.find(s => s.store_name === purchase.store_name);
    const vendor = vendors.find(v => v.vendor_name === purchase.vendor_name && v.store_id === store?.store_id);
    setForm({
      store_id: store?.store_id?.toString() || '',
      vendor_id: vendor?.id?.toString() || '',
      purchase_date: purchase.purchase_date,
      amount: purchase.amount.toString(),
    });
    setEditData({
      ...purchase,
      store_id: store?.store_id,
      vendor_id: vendor?.id,
      purchase_date: toDateString(purchase.purchase_date),
    });
    setModalType('edit');
    setShowModal(true);
    setModalError('');
  };
  const closeModal = () => {
    setShowModal(false);
    setEditData(null);
    setModalType(null);
    setModalError('');
  };

  const handleFormChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function formatInputAmount(val: string) {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('ko-KR');
  }

  const handleAmountInput = (e: any) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, amount: raw ? Number(raw).toLocaleString('ko-KR') : '' });
  };

  const handleRegister = async () => {
    if (!form.store_id || !form.vendor_id || !form.purchase_date || !form.amount) {
      setModalError('모든 항목을 입력하세요.');
      return;
    }
    try {
      await insertData('purchases', {
        store_id: Number(form.store_id),
        vendor_id: Number(form.vendor_id),
        purchase_date: form.purchase_date,
        amount: Number(form.amount.replace(/[^0-9]/g, '')),
      });
      closeModal();
      fetchAllData();
    } catch (err: any) {
      setModalError('등록 실패: ' + err.message);
    }
  };
  const handleEdit = async () => {
    if (!form.store_id || !form.vendor_id || !form.purchase_date || !form.amount) {
      setModalError('모든 항목을 입력하세요.');
      return;
    }
    try {
      const originalPK = {
        store_id: Number(editData?.store_id),
        vendor_id: Number(editData?.vendor_id),
        purchase_date: toDateString(editData?.purchase_date || ''),
      };
      const newPK = {
        store_id: Number(form.store_id),
        vendor_id: Number(form.vendor_id),
        purchase_date: toDateString(form.purchase_date),
      };
      const isPKChanged =
        originalPK.store_id !== newPK.store_id ||
        originalPK.vendor_id !== newPK.vendor_id ||
        originalPK.purchase_date !== newPK.purchase_date;
      if (isPKChanged) {
        // 삭제 전 실제 row가 존재하는지 확인
        const exists = await checkPurchaseExists(
          Number(originalPK.store_id),
          Number(originalPK.vendor_id),
          originalPK.purchase_date
        );
        if (exists) {
          await deleteData('purchases', originalPK);
        }
        await insertData('purchases', {
          ...newPK,
          amount: Number(form.amount.replace(/[^0-9]/g, '')),
        });
      } else {
        await updateData('purchases', originalPK, {
          ...newPK,
          amount: Number(form.amount.replace(/[^0-9]/g, '')),
        });
      }
      closeModal();
      fetchAllData();
    } catch (err: any) {
      setModalError('수정 실패: ' + err.message);
    }
  };
  const handleDelete = async (purchase: PurchaseData) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const store = availableStores.find(s => s.store_name === purchase.store_name);
    const vendor = vendors.find(v => v.vendor_name === purchase.vendor_name && v.store_id === store?.store_id);
    try {
      await deleteData('purchases', {
        store_id: store?.store_id,
        vendor_id: vendor?.id,
        purchase_date: purchase.purchase_date,
      });
      fetchAllData();
    } catch (err: any) {
      alert('삭제 실패: ' + err.message);
    }
  };

  // 날짜를 YYYY-MM-DD로 변환
  function toDateString(date: string) {
    if (!date) return '';
    return date.split('T')[0];
  }

  // purchases에서 특정 row가 존재하는지 확인
  async function checkPurchaseExists(store_id: number, vendor_id: number, purchase_date: string) {
    const res = await fetchData('purchases', {
      filters: {
        eq: {
          store_id,
          vendor_id,
          purchase_date
        }
      }
    });
    return res.success && res.data && res.data.length > 0;
  }

  useImperativeHandle(ref, () => ({
    openRegisterModal,
  }));

  if (loading) return null;
  if (error) {
    return (
      <div className="purchases-content">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="purchases-content">
      <div className="date-filters">
        <div className="select-wrapper">
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="year-select">
            {years.map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
        </div>
        <div className="select-wrapper">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="month-select">
            {months.map(month => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </select>
        </div>
      </div>
      <div className="store-summary">
        <h2 className="summary-title" style={{ marginBottom: 16 }}>점포별 매입현황</h2>
        <div className="summary-grid">
          {availableStores
            .filter(store => store.store_name !== '더블유 스튜디오' && store.store_name !== '위시크래프터')
            .map(store => {
              const storeTotal = calculateStoreTotal(store.store_name);
              const storeVendors = getStoreVendors(store.store_id)
                .filter(v => v.category === '매입')
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
              const vendorPurchaseSum: { [key: string]: number } = {};
              filteredPurchasesByDate.forEach(p => {
                let vendorId = null;
                let storeId = null;
                if ('vendor_id' in p && 'store_id' in p) {
                  vendorId = (p as any).vendor_id;
                  storeId = (p as any).store_id;
                } else {
                  const storeObj = availableStores.find(s => s.store_name === p.store_name);
                  const vendorObj = vendors.find(v => v.vendor_name === p.vendor_name && v.store_id === storeObj?.store_id && v.category === '매입');
                  vendorId = vendorObj?.id;
                  storeId = storeObj?.store_id;
                }
                if (vendorId && storeId === store.store_id) {
                  const key = `${storeId}-${vendorId}`;
                  if (!vendorPurchaseSum[key]) vendorPurchaseSum[key] = 0;
                  vendorPurchaseSum[key] += p.amount || 0;
                }
              });
              return (
                <div key={store.store_id} className="store-total-card">
                  <div className="store-name">{store.store_name}</div>
                  <div className="store-details">
                    <div className="amount-row">
                      <span className="amount-label">총매입</span>
                      <span className="amount-value">{formatAmount(storeTotal.total)}원</span>
                    </div>
                    {storeVendors.map(vendor => {
                      const key = `${store.store_id}-${vendor.id}`;
                      return (
                        <div key={vendor.id} className="amount-row">
                          <span
                            className="amount-label"
                            style={{ position: 'relative', cursor: vendor.bank_account ? 'pointer' : 'default' }}
                            title={vendor.bank_account ? `계좌번호: ${vendor.bank_account}` : ''}
                          >
                            {vendor.vendor_name}
                          </span>
                          <span className="amount-value">{formatAmount(vendorPurchaseSum[key] || 0)}원</span>
                        </div>
                      );
                    })}
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
            <input type="checkbox" checked={allStoresSelected} onChange={toggleAllStores} />
            <span className="checkmark"></span>
            <span className="label-text">전체 선택</span>
          </label>
        </div>
        <div className="store-toggles">
          {availableStores
            .filter(store => store.store_name !== '더블유 스튜디오' && store.store_name !== '위시크래프터')
            .map(store => (
              <label key={store.store_name} className="checkbox-wrapper">
                <input type="checkbox" checked={selectedStores.has(store.store_name)} onChange={() => toggleStore(store.store_name)} />
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
              {Object.entries(columnMapping).filter(([key]) => key !== 'actions').map(([key, label]) => (
                <th key={key} className={columnStyles[key as keyof typeof columnStyles]}>
                  {label}
                </th>
              ))}
              <th className="col-actions text-center min-w-[100px] max-w-[120px]">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(columnMapping).length} className="empty-state">등록된 매입 데이터가 없습니다.</td>
              </tr>
            ) : (
              filteredPurchases.map((purchase, idx) => (
                <tr key={idx}>
                  {Object.keys(columnMapping).filter(key => key !== 'actions').map((key) => (
                    <td key={key} className={columnStyles[key as keyof typeof columnStyles]}>
                      {formatCellValue(purchase, key as keyof PurchaseData)}
                    </td>
                  ))}
                  <td className="col-actions text-center min-w-[100px] max-w-[120px]">
                    <button className="btn btn-sm btn-primary" style={{ marginRight: 8 }} onClick={() => openEditModal(purchase)}>수정</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(purchase)}>삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,41,59,0.18)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="modal" style={{ background:'#fff', borderRadius:16, padding:'36px 32px 28px 32px', minWidth:340, minHeight:340, boxShadow:'0 8px 32px rgba(30,41,59,0.18)', position:'relative', display:'flex', flexDirection:'column', gap:18 }}>
            <h3 style={{ fontWeight:700, fontSize:'1.18rem', marginBottom:18, color:'#1e293b', letterSpacing:'-0.5px' }}>{modalType === 'register' ? '매입 등록' : '매입 수정'}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <label style={{ fontWeight:500, color:'#334155', fontSize:'0.97rem' }}>점포명
                <select name="store_id" value={form.store_id} onChange={handleFormChange} style={{ width:'100%', marginTop:6, padding:'10px 12px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:'1rem', background:'#f8fafc', boxSizing:'border-box', height:44 }}>
                  <option value="">선택</option>
                  {availableStores.filter(store => ALLOWED_STORE_IDS.includes(store.store_id)).map(store => (
                    <option key={store.store_id} value={store.store_id}>{store.store_name}</option>
                  ))}
                </select>
              </label>
              <label style={{ fontWeight:500, color:'#334155', fontSize:'0.97rem' }}>거래처명
                <select name="vendor_id" value={form.vendor_id} onChange={handleFormChange} style={{ width:'100%', marginTop:6, padding:'10px 12px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:'1rem', background:'#f8fafc', boxSizing:'border-box', height:44 }}>
                  <option value="">선택</option>
                  {vendors
                    .filter(v => v.category === '매입' && (!form.store_id || v.store_id === Number(form.store_id)))
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map(vendor => (
                      <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
                    ))}
                </select>
              </label>
              <label style={{ fontWeight:500, color:'#334155', fontSize:'0.97rem' }}>매입일자
                <input type="date" name="purchase_date" value={form.purchase_date} onChange={handleFormChange} style={{ width:'100%', marginTop:6, padding:'10px 12px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:'1rem', background:'#f8fafc', boxSizing:'border-box', height:44 }} />
              </label>
              <label style={{ fontWeight:500, color:'#334155', fontSize:'0.97rem' }}>매입금액
                <input
                  type="text"
                  name="amount"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: formatInputAmount(e.target.value) })}
                  style={{ width:'100%', marginTop:6, padding:'10px 12px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:'1rem', background:'#f8fafc', boxSizing:'border-box', height:44 }}
                  autoComplete="off"
                  placeholder="숫자만 입력"
                />
              </label>
            </div>
            {modalError && <div style={{ color:'#ef4444', marginTop:8, fontWeight:500 }}>{modalError}</div>}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:24 }}>
              <button className="btn btn-secondary" style={{ borderRadius:6, padding:'8px 18px', fontWeight:600, fontSize:'0.97rem' }} onClick={closeModal}>취소</button>
              {modalType === 'register' ? (
                <button className="btn btn-primary" style={{ borderRadius:6, padding:'8px 18px', fontWeight:600, fontSize:'0.97rem', boxShadow:'0 2px 8px rgba(49,130,206,0.08)' }} onClick={handleRegister}>등록</button>
              ) : (
                <button className="btn btn-primary" style={{ borderRadius:6, padding:'8px 18px', fontWeight:600, fontSize:'0.97rem', boxShadow:'0 2px 8px rgba(49,130,206,0.08)' }} onClick={handleEdit}>수정</button>
              )}
            </div>
            <button onClick={closeModal} style={{ position:'absolute', top:18, right:18, background:'none', border:'none', fontSize:'1.3rem', color:'#64748b', cursor:'pointer' }} aria-label="닫기">×</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default PurchasesContent;
