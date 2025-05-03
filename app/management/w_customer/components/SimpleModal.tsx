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
      }, 300); // 모달 닫힘 애니메이션 후에 초기화
    }
  }, [isOpen, initialRoomNo]);

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
        deposit: deposit ? parseInt(deposit) : 0,
        monthly_fee: monthly ? parseInt(monthly) : 0,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {initialRoomNo ? `${initialRoomNo}호 고객 등록` : '신규 고객 등록'}
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름 *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="홍길동"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">방 번호 *</label>
                  <input
                    type="number"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    min="1"
                    max="15"
                    required
                    readOnly={!!initialRoomNo}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${initialRoomNo ? 'bg-gray-100' : ''}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">보증금</label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="500000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">월세</label>
                  <input
                    type="number"
                    value={monthly}
                    onChange={(e) => setMonthly(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="300000"
                  />
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {loading ? '등록 중...' : '등록하기'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 