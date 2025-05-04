'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
  initialRoomNo?: number; // 선택적 방 번호 프롭 추가
}

export default function SimpleModal({ isOpen, onClose, onCustomerCreated, initialRoomNo }: SimpleModalProps) {
  const [name, setName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [deposit, setDeposit] = useState('');
  const [monthly, setMonthly] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  // 모달이 열릴 때 초기 방 번호가 있으면 설정
  useEffect(() => {
    if (isOpen && initialRoomNo) {
      setRoomNo(initialRoomNo.toString());
    }
  }, [isOpen, initialRoomNo]);
  
  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName('');
        setRoomNo(initialRoomNo ? initialRoomNo.toString() : '');
        setDeposit('');
        setMonthly('');
        setPhone('');
        setMemo('');
      }, 300); // 모달 닫힘 애니메이션 후에 초기화
    }
  }, [isOpen, initialRoomNo]);

  // 금액 입력 시 자동 콤마 추가
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setDeposit(value ? parseInt(value).toLocaleString() : '');
  };

  const handleMonthlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setMonthly(value ? parseInt(value).toLocaleString() : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !roomNo.trim()) {
      alert('이름과 방 번호는 필수입니다.');
      return;
    }
    
    setLoading(true);
    
    try {
      // 기본값 설정
      const today = new Date().toISOString().split('T')[0];
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      
      const { error } = await supabase.from('w_customers').insert({
        name,
        room_no: parseInt(roomNo),
        deposit: deposit ? parseInt(deposit.replace(/,/g, '')) : 0,
        monthly_fee: monthly ? parseInt(monthly.replace(/,/g, '')) : 0,
        phone: phone || null,
        memo: memo || null,
        status: '입실',
        move_in_date: today,
        move_out_date: sixMonthsLater.toISOString().split('T')[0]
      });
      
      if (error) throw error;
      
      onCustomerCreated();
      onClose();
    } catch (err) {
      console.error('고객 등록 오류:', err);
      alert('고객 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialRoomNo ? `${initialRoomNo}호 고객 등록` : '고객 등록'}</h2>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="홍길동"
                />
              </div>
              
              <div className="form-group">
                <label>방 번호 *</label>
                <input
                  type="number"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  min="1"
                  max="15"
                  required
                  readOnly={!!initialRoomNo}
                  className={initialRoomNo ? 'bg-gray-100' : ''}
                />
              </div>
              
              <div className="form-group">
                <label>보증금</label>
                <input
                  type="text"
                  value={deposit}
                  onChange={handleDepositChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>월세</label>
                <input
                  type="text"
                  value={monthly}
                  onChange={handleMonthlyChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>연락처</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                />
              </div>
              
              <div className="form-group">
                <label>상태</label>
                <select disabled className="bg-gray-100">
                  <option value="입실">입실</option>
                </select>
              </div>
              
              <div className="form-group col-span-2">
                <label>메모</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  placeholder="특이사항이나 메모를 입력하세요"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '등록 중...' : '등록'}
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