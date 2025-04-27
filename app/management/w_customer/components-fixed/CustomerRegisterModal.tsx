'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

interface CustomerData {
  room_no: number;
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

interface CustomerRegisterModalProps {
  onClose: () => void;
  onCustomerCreated: () => void;
}

export default function CustomerRegisterModal({
  onClose,
  onCustomerCreated
}: CustomerRegisterModalProps) {
  const [newCustomer, setNewCustomer] = useState<CustomerData>({
    room_no: 0,
    name: '',
    deposit: 0,
    monthly_fee: 0,
    first_fee: 0,
    move_in_date: null,
    move_out_date: null,
    status: '입실',
    memo: '',
    resident_id: '',
    phone: '',
    phone_sub: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 입력 필드 변경 핸들러
  const handleInputChange = (key: keyof CustomerData, value: any) => {
    setNewCustomer(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 숫자 입력 핸들러 (금액)
  const handleNumberChange = (key: keyof CustomerData, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value.replace(/[^0-9]/g, ''), 10);
    handleInputChange(key, numValue);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Supabase에 새 고객 데이터 추가
      const { error: insertError } = await supabase
        .from('w_customers')
        .insert([{
          ...newCustomer,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (insertError) throw insertError;
      
      // 성공 시 콜백 호출 및 모달 닫기
      onCustomerCreated();
    } catch (err: any) {
      console.error('고객 등록 중 오류 발생:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content register-modal">
        <div className="modal-header">
          <h3>새 고객 등록</h3>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="room_no">방 번호</label>
              <input
                type="number"
                id="room_no"
                value={newCustomer.room_no}
                onChange={e => handleInputChange('room_no', parseInt(e.target.value, 10))}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="name">고객명</label>
              <input
                type="text"
                id="name"
                value={newCustomer.name}
                onChange={e => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">상태</label>
              <select
                id="status"
                value={newCustomer.status}
                onChange={e => handleInputChange('status', e.target.value)}
              >
                <option value="입실">입실</option>
                <option value="퇴실">퇴실</option>
                <option value="예약">예약</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="deposit">보증금</label>
              <input
                type="text"
                id="deposit"
                value={newCustomer.deposit.toLocaleString()}
                onChange={e => handleNumberChange('deposit', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="monthly_fee">월 이용료</label>
              <input
                type="text"
                id="monthly_fee"
                value={newCustomer.monthly_fee.toLocaleString()}
                onChange={e => handleNumberChange('monthly_fee', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="first_fee">초기 비용</label>
              <input
                type="text"
                id="first_fee"
                value={newCustomer.first_fee.toLocaleString()}
                onChange={e => handleNumberChange('first_fee', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="move_in_date">입주일</label>
              <input
                type="date"
                id="move_in_date"
                value={newCustomer.move_in_date || ''}
                onChange={e => handleInputChange('move_in_date', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="move_out_date">퇴실일</label>
              <input
                type="date"
                id="move_out_date"
                value={newCustomer.move_out_date || ''}
                onChange={e => handleInputChange('move_out_date', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">연락처</label>
              <input
                type="text"
                id="phone"
                value={newCustomer.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone_sub">추가 연락처</label>
              <input
                type="text"
                id="phone_sub"
                value={newCustomer.phone_sub}
                onChange={e => handleInputChange('phone_sub', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="resident_id">주민등록번호</label>
              <input
                type="text"
                id="resident_id"
                value={newCustomer.resident_id}
                onChange={e => handleInputChange('resident_id', e.target.value)}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="address">주소</label>
              <input
                type="text"
                id="address"
                value={newCustomer.address}
                onChange={e => handleInputChange('address', e.target.value)}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="memo">메모</label>
              <textarea
                id="memo"
                value={newCustomer.memo}
                onChange={e => handleInputChange('memo', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 