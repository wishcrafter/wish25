'use client';

import { useState } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<CustomerProps>({...customer});

  // 편집 모드 전환
  const toggleEditMode = () => {
    if (isEditing) {
      // 편집 취소 시 원래 값으로 복원
      setEditedCustomer({...customer});
    }
    setIsEditing(!isEditing);
  };

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
      setIsEditing(false);
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
          <h2>{customer.room_no}호 {customer.name} {isEditing ? '수정' : '상세정보'}</h2>
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
                <label>이름</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedCustomer.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                ) : (
                  <span className="form-value">{customer.name}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>방 번호</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={editedCustomer.room_no || ''}
                    onChange={(e) => handleInputChange('room_no', parseInt(e.target.value))}
                    min="1"
                    max="15"
                    required
                  />
                ) : (
                  <span className="form-value">{customer.room_no || '-'}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>보증금</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formatPrice(editedCustomer.deposit)}
                    onChange={handleDepositChange}
                    placeholder="0"
                  />
                ) : (
                  <span className="form-value">{formatPrice(customer.deposit)}원</span>
                )}
              </div>
              
              <div className="form-group">
                <label>월세</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formatPrice(editedCustomer.monthly_fee)}
                    onChange={handleMonthlyChange}
                    placeholder="0"
                  />
                ) : (
                  <span className="form-value">{formatPrice(customer.monthly_fee)}원</span>
                )}
              </div>
              
              <div className="form-group">
                <label>상태</label>
                {isEditing ? (
                  <select
                    value={editedCustomer.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="입실">입실</option>
                    <option value="퇴실">퇴실</option>
                    <option value="예약">예약</option>
                  </select>
                ) : (
                  <span className={`form-value status-badge ${
                    customer.status === '입실' ? 'status-active' : 
                    customer.status === '퇴실' ? 'status-inactive' : 
                    'status-pending'
                  }`}>{customer.status}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>연락처</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedCustomer.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="010-0000-0000"
                  />
                ) : (
                  <span className="form-value">{customer.phone || '-'}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>입주일</label>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={formatDate(editedCustomer.move_in_date)}
                    onChange={(e) => handleInputChange('move_in_date', e.target.value)}
                  />
                ) : (
                  <span className="form-value">{formatDate(customer.move_in_date)}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>퇴실일</label>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={formatDate(editedCustomer.move_out_date)}
                    onChange={(e) => handleInputChange('move_out_date', e.target.value)}
                  />
                ) : (
                  <span className="form-value">{formatDate(customer.move_out_date)}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>추가 연락처</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedCustomer.phone_sub || ''}
                    onChange={(e) => handleInputChange('phone_sub', e.target.value)}
                    placeholder="추가 연락처"
                  />
                ) : (
                  <span className="form-value">{customer.phone_sub || '-'}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>주소</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedCustomer.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="주소"
                  />
                ) : (
                  <span className="form-value">{customer.address || '-'}</span>
                )}
              </div>
              
              <div className="form-group col-span-2">
                <label>메모</label>
                {isEditing ? (
                  <textarea 
                    rows={3}
                    value={editedCustomer.memo || ''}
                    onChange={(e) => handleInputChange('memo', e.target.value)}
                    placeholder="특이사항이나 메모"
                  ></textarea>
                ) : (
                  <span className="form-value">{customer.memo || '-'}</span>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            {isEditing ? (
              <>
                <button type="button" className="btn btn-secondary" onClick={toggleEditMode}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  닫기
                </button>
                <button type="button" className="btn btn-primary" onClick={toggleEditMode}>
                  수정
                </button>
              </>
            )}
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
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }
        
        .status-active {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-inactive {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
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