'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface CustomerProps {
  id: number;
  room_no: number | null;
  name: string;
  deposit: number;
  monthly_fee: number;
  first_fee: number;
  move_in_date: string | null;
  move_out_date: string | null;
  status: string;
  memo: string;
  resident_id: string;
  phone: string;
  phone_sub: string;
  address: string;
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProps;
  onCustomerUpdated?: () => void;
}

export default function CustomerDetailModal({ isOpen, onClose, customer, onCustomerUpdated }: CustomerDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<CustomerProps>({...customer});
  
  // 고객 정보가 바뀌면 편집 정보도 업데이트
  useEffect(() => {
    if (isOpen && customer) {
      setEditedCustomer({...customer});
    }
  }, [isOpen, customer]);

  // 금액 입력 시 자동 콤마 추가
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setEditedCustomer({
      ...editedCustomer, 
      deposit: value ? parseInt(value) : 0
    });
  };

  const handleMonthlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setEditedCustomer({
      ...editedCustomer, 
      monthly_fee: value ? parseInt(value) : 0
    });
  };
  
  const handleFirstFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setEditedCustomer({
      ...editedCustomer, 
      first_fee: value ? parseInt(value) : 0
    });
  };

  // 입력 값 변경 핸들러
  const handleInputChange = (field: keyof CustomerProps, value: any) => {
    setEditedCustomer({
      ...editedCustomer,
      [field]: value
    });
  };

  // 수정 내용 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('w_customers')
        .update({
          name: editedCustomer.name,
          room_no: editedCustomer.room_no,
          deposit: editedCustomer.deposit,
          monthly_fee: editedCustomer.monthly_fee,
          first_fee: editedCustomer.first_fee,
          status: editedCustomer.status,
          move_in_date: editedCustomer.move_in_date,
          move_out_date: editedCustomer.move_out_date,
          phone: editedCustomer.phone || null,
          phone_sub: editedCustomer.phone_sub || null,
          address: editedCustomer.address || null,
          memo: editedCustomer.memo || null
        })
        .eq('id', customer.id);

      if (error) throw error;
      
      if (onCustomerUpdated) onCustomerUpdated();
      alert('고객 정보가 수정되었습니다.');
    } catch (err) {
      console.error('고객 정보 수정 오류:', err);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  // 금액 포맷팅
  const formatPrice = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{customer.room_no}호 {customer.name} 정보 수정</h2>
          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>이름 *</label>
                <input 
                  type="text" 
                  value={editedCustomer.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>방 번호 *</label>
                <input 
                  type="number" 
                  value={editedCustomer.room_no || ''}
                  onChange={(e) => handleInputChange('room_no', parseInt(e.target.value))}
                  min="1"
                  max="15"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>보증금</label>
                <input 
                  type="text" 
                  value={formatPrice(editedCustomer.deposit)}
                  onChange={handleDepositChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>월세</label>
                <input 
                  type="text" 
                  value={formatPrice(editedCustomer.monthly_fee)}
                  onChange={handleMonthlyChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>첫달 월세</label>
                <input 
                  type="text" 
                  value={formatPrice(editedCustomer.first_fee)}
                  onChange={handleFirstFeeChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>상태</label>
                <select
                  value={editedCustomer.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="입실">입실</option>
                  <option value="퇴실">퇴실</option>
                  <option value="예약">예약</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>입주일</label>
                <input 
                  type="date" 
                  value={formatDate(editedCustomer.move_in_date)}
                  onChange={(e) => handleInputChange('move_in_date', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>퇴실일</label>
                <input 
                  type="date" 
                  value={formatDate(editedCustomer.move_out_date)}
                  onChange={(e) => handleInputChange('move_out_date', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>연락처</label>
                <input 
                  type="text" 
                  value={editedCustomer.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="010-0000-0000"
                />
              </div>
              
              <div className="form-group">
                <label>추가 연락처</label>
                <input 
                  type="text" 
                  value={editedCustomer.phone_sub || ''}
                  onChange={(e) => handleInputChange('phone_sub', e.target.value)}
                  placeholder="추가 연락처"
                />
              </div>
              
              <div className="form-group">
                <label>주소</label>
                <input 
                  type="text" 
                  value={editedCustomer.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="주소"
                />
              </div>
              
              <div className="form-group col-span-2">
                <label>메모</label>
                <textarea 
                  rows={3}
                  value={editedCustomer.memo || ''}
                  onChange={(e) => handleInputChange('memo', e.target.value)}
                  placeholder="특이사항이나 메모"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          width: 90%;
          max-width: 720px;
          max-height: 90vh;
          overflow: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #9ca3af;
        }
        
        .modal-close:hover {
          color: #6b7280;
        }
        
        .modal-body {
          padding: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          width: 80px;
          min-width: 80px;
          margin-right: 0.75rem;
        }
        
        .form-group.col-span-2 {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .form-group.col-span-2 label {
          margin-bottom: 0.5rem;
          width: auto;
        }
        
        .form-value {
          font-size: 0.875rem;
          color: #1f2937;
          flex: 1;
        }
        
        .form-group input, 
        .form-group select,
        .form-group textarea {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          flex: 1;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .modal-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        .btn-primary {
          background-color: #3b82f6;
          color: white;
          border: none;
        }
        
        .btn-primary:hover {
          background-color: #2563eb;
        }
        
        .btn-primary:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background-color: #f3f4f6;
          color: #1f2937;
          border: 1px solid #d1d5db;
        }
        
        .btn-secondary:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
} 