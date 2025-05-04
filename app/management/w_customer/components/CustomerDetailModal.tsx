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
              <h3 className="text-lg font-semibold text-gray-900">
                {customer.room_no}호 {customer.name} 님
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
            
            <div className="modal-body mt-4">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">상태</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">보증금</span>
                  <span className="font-medium">{formatPrice(customer.deposit)}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">월세</span>
                  <span className="font-medium">{formatPrice(customer.monthly_fee)}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">입주일</span>
                  <span>{formatDate(customer.move_in_date)}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">퇴실일</span>
                  <span>{formatDate(customer.move_out_date)}</span>
                </div>
                
                {customer.phone && (
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">연락처</span>
                    <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
                
                {customer.phone_sub && (
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">추가 연락처</span>
                    <a href={`tel:${customer.phone_sub}`} className="text-blue-600 hover:underline">
                      {customer.phone_sub}
                    </a>
                  </div>
                )}
                
                {customer.address && (
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">주소</span>
                    <span>{customer.address}</span>
                  </div>
                )}
                
                {customer.memo && (
                  <div className="border-b border-gray-100 py-2">
                    <div className="text-gray-500 mb-1">메모</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.memo}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer mt-5 pt-3 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 