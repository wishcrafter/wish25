'use client';

import { useState } from 'react';

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
}

export default function CustomerDetailModal({ isOpen, onClose, customer }: CustomerDetailModalProps) {
  if (!isOpen) return null;

  // 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  // 금액 포맷팅
  const formatPrice = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '입실':
        return 'bg-green-100 text-green-800';
      case '퇴실':
        return 'bg-red-100 text-red-800';
      case '예약':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 transition-opacity">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="modal-content relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-modalAppear">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="modal-header flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="inline-block w-8 h-8 rounded-full bg-blue-100 text-blue-800 mr-2 flex items-center justify-center">
                  {customer.room_no || '-'}
                </span>
                {customer.name} 님 상세정보
              </h3>
              <button 
                onClick={onClose}
                className="modal-close text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body mt-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">방 번호</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{customer.room_no || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">상태</p>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(customer.status)}`}>
                        {customer.status}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">보증금</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{formatPrice(customer.deposit)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">월세</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{formatPrice(customer.monthly_fee)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">입주일</p>
                    <p className="mt-1 text-base text-gray-900">{formatDate(customer.move_in_date)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">퇴실일</p>
                    <p className="mt-1 text-base text-gray-900">{formatDate(customer.move_out_date)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">연락처</p>
                    <p className="mt-1 text-base text-gray-900 flex items-center">
                      {customer.phone || '-'}
                      {customer.phone && (
                        <a href={`tel:${customer.phone}`} className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </a>
                      )}
                    </p>
                  </div>
                  
                  {customer.phone_sub && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">추가 연락처</p>
                      <p className="mt-1 text-base text-gray-900 flex items-center">
                        {customer.phone_sub}
                        <a href={`tel:${customer.phone_sub}`} className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </a>
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">주소</p>
                    <p className="mt-1 text-base text-gray-900">{customer.address || '-'}</p>
                  </div>
                  
                  {customer.memo && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">메모</p>
                      <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{customer.memo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer mt-5 sm:mt-4 sm:flex sm:flex-row-reverse pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 