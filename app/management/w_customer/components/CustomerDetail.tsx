'use client';

import { useState, useEffect } from 'react';
import { CustomerData } from '../types';

interface CustomerDetailProps {
  customer: CustomerData;
  onSave: (customer: CustomerData) => Promise<boolean>;
  onClose: () => void;
}

export default function CustomerDetail({ customer, onSave, onClose }: CustomerDetailProps) {
  const [editedCustomer, setEditedCustomer] = useState(customer);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedCustomer(customer);
  }, [customer]);

  const handleInputChange = (field: keyof CustomerData, value: any) => {
    setEditedCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const success = await onSave(editedCustomer);
      if (!success) {
        setError('저장에 실패했습니다.');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-medium">고객 상세 정보</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">호실</label>
              <input
                type="number"
                value={editedCustomer.room_no || ''}
                onChange={(e) => handleInputChange('room_no', e.target.value ? parseInt(e.target.value) : 0)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">이름</label>
              <input
                type="text"
                value={editedCustomer.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">보증금</label>
              <input
                type="number"
                value={editedCustomer.deposit || ''}
                onChange={(e) => handleInputChange('deposit', e.target.value ? parseInt(e.target.value) : 0)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">월세</label>
              <input
                type="number"
                value={editedCustomer.monthly_fee || ''}
                onChange={(e) => handleInputChange('monthly_fee', e.target.value ? parseInt(e.target.value) : 0)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">입실일</label>
              <input
                type="date"
                value={editedCustomer.move_in_date || ''}
                onChange={(e) => handleInputChange('move_in_date', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">퇴실일</label>
              <input
                type="date"
                value={editedCustomer.move_out_date || ''}
                onChange={(e) => handleInputChange('move_out_date', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">상태</label>
              <select
                value={editedCustomer.status || ''}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">선택</option>
                <option value="입실">입실</option>
                <option value="퇴실">퇴실</option>
                <option value="계약">계약</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">선납금</label>
              <input
                type="number"
                value={editedCustomer.first_fee || ''}
                onChange={(e) => handleInputChange('first_fee', e.target.value ? parseInt(e.target.value) : 0)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">주민번호</label>
              <input
                type="text"
                value={editedCustomer.resident_id || ''}
                onChange={(e) => handleInputChange('resident_id', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">연락처</label>
              <input
                type="text"
                value={editedCustomer.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">비상연락처</label>
              <input
                type="text"
                value={editedCustomer.phone_sub || ''}
                onChange={(e) => handleInputChange('phone_sub', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-24 text-sm text-gray-600">주소</label>
              <input
                type="text"
                value={editedCustomer.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="flex-1 h-9 px-3 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-start">
              <label className="w-24 text-sm text-gray-600 mt-2">메모</label>
              <textarea
                value={editedCustomer.memo || ''}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-center text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 flex justify-end space-x-2 border-t">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 h-9 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={onClose}
            className="px-4 h-9 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
} 