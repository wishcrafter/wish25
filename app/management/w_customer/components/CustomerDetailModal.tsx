'use client';

import { useState } from 'react';
import { CustomerData } from '@/types/types';

interface CustomerDetailModalProps {
  customer: CustomerData;
  onClose: () => void;
  onSave: (updatedCustomer: CustomerData) => void;
  columnMapping: { [key: string]: string };
  columnStyles: { [key: string]: string };
  formatPrice: (price: number) => string;
  formatDate: (dateString: string | null) => string;
  getStatusClass: (status: string) => string;
}

export default function CustomerDetailModal({
  customer,
  onClose,
  onSave,
  columnMapping,
  columnStyles,
  formatPrice,
  formatDate,
  getStatusClass
}: CustomerDetailModalProps) {
  const [editedCustomer, setEditedCustomer] = useState<CustomerData>({...customer});
  const [isEditing, setIsEditing] = useState(false);

  // 수정 모드 토글
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (key: keyof CustomerData, value: any) => {
    setEditedCustomer(prev => ({
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedCustomer);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>고객 {isEditing ? '정보 수정' : '상세 정보'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">방 번호</label>
                <div className="mt-1 text-sm text-gray-900">{customer.room_no}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">고객명</label>
                <div className="mt-1 text-sm text-gray-900">{customer.name}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">보증금</label>
                <div className="mt-1 text-sm text-gray-900">{formatPrice(customer.deposit)}원</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">월 이용료</label>
                <div className="mt-1 text-sm text-gray-900">{formatPrice(customer.monthly_fee)}원</div>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">입주일</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(customer.move_in_date)}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">퇴실일</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(customer.move_out_date)}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <div className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">메모</label>
                <div className="mt-1 text-sm text-gray-900">{customer.memo || '-'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          {isEditing ? (
            <>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setEditedCustomer({...customer});
                  setIsEditing(false);
                }}
              >
                취소
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
              >
                닫기
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={toggleEditMode}
              >
                수정하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 