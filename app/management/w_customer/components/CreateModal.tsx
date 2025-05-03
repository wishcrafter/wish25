'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '@/utils/supabase';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

// 빈 고객 데이터 초기값
const emptyCustomer = {
  id: 0,
  room_no: null,
  name: '',
  deposit: 0,
  monthly_fee: 0,
  first_fee: 0,
  move_in_date: new Date().toISOString().split('T')[0],
  move_out_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
  status: '입실',
  memo: '',
  resident_id: '',
  phone: '',
  phone_sub: '',
  address: ''
};

export default function CreateModal({ isOpen, onClose, onCustomerCreated }: CreateModalProps) {
  const [formData, setFormData] = useState(emptyCustomer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // 숫자형 필드 변환
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('w_customers')
        .insert({
          room_no: formData.room_no || null,
          name: formData.name,
          deposit: formData.deposit,
          monthly_fee: formData.monthly_fee,
          first_fee: formData.first_fee,
          move_in_date: formData.move_in_date,
          move_out_date: formData.move_out_date,
          status: formData.status,
          memo: formData.memo,
          resident_id: formData.resident_id,
          phone: formData.phone,
          phone_sub: formData.phone_sub,
          address: formData.address
        })
        .select();

      if (error) throw error;
      onCustomerCreated();
    } catch (err: any) {
      console.error('고객 등록 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 시 초기화
  const handleClose = () => {
    setFormData(emptyCustomer);
    setError(null);
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={handleClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* 모달 중앙 정렬 */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                신규 고객 등록
              </Dialog.Title>
              
              {error && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* 방 번호 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">방 번호</label>
                    <input
                      type="number"
                      name="room_no"
                      value={formData.room_no || ''}
                      onChange={handleChange}
                      min="1"
                      max="15"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* 이름 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">이름 *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* 보증금 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">보증금</label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* 월세 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">월세</label>
                    <input
                      type="number"
                      name="monthly_fee"
                      value={formData.monthly_fee}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* 입주일 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">입주일</label>
                    <input
                      type="date"
                      name="move_in_date"
                      value={formData.move_in_date}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* 퇴실일 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">퇴실일</label>
                    <input
                      type="date"
                      name="move_out_date"
                      value={formData.move_out_date}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* 상태 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">상태</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="입실">입실</option>
                      <option value="퇴실">퇴실</option>
                      <option value="예약">예약</option>
                    </select>
                  </div>
                  
                  {/* 전화번호 */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">전화번호</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* 주소 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">주소</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                {/* 메모 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">메모</label>
                  <textarea
                    name="memo"
                    value={formData.memo}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleClose}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {loading ? '등록 중...' : '등록하기'}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
} 