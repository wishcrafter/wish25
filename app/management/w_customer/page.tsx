'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/app/components/PageLayout';
import WCustomerContent from './components/WCustomerContent';
import SimpleModal from './components/SimpleModal';
import CustomerDetailModal from './components/CustomerDetailModal';

export default function WCustomerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('입실');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // 고객 등록 완료 후 새로고침 트리거
  const handleCustomerCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 방번호로 고객 등록 모달 열기
  const openModalWithRoom = (roomNo: number) => {
    setSelectedRoom(roomNo);
    setModalOpen(true);
  };

  // 고객 상세보기 모달 열기
  const openDetailModal = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  // 상태 필터 변경 핸들러
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // 모달 창 닫기
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRoom(undefined);
  };

  // 상세보기 모달 닫기
  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedCustomer(null);
  };

  // 상단 액션 버튼
  const actions = (
    <div className="flex space-x-2">
      <button 
        className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        onClick={() => setModalOpen(true)}
      >
        고객 등록
      </button>
    </div>
  );

  // 상태별 배경 및 텍스트 색상
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '입실':
        return 'bg-green-100 text-green-800 hover:bg-green-200 ring-green-500';
      case '퇴실':
        return 'bg-red-100 text-red-800 hover:bg-red-200 ring-red-500';
      case '예약':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ring-yellow-500';
      case '전체':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 ring-blue-500';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-gray-500';
    }
  };

  return (
    <PageLayout 
      title="스튜디오 고객 관리"
      actions={actions}
      error={error}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="p-4 bg-white rounded-lg shadow mb-4">
        <div className="filter-container mb-6 border-b pb-4">
          <h3 className="filter-label text-base font-medium text-gray-700 mb-3">상태 필터</h3>
          <div className="filter-options flex flex-wrap gap-2">
            {['입실', '퇴실', '예약', '전체'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`filter-btn px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === status 
                    ? `${getStatusStyle(status)} shadow-sm ring-2 ring-offset-2` 
                    : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <WCustomerContent
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onCustomerCreated={handleCustomerCreated}
          onLoadingChange={setLoading}
          onErrorChange={setError}
          onRoomSelect={openModalWithRoom}
          onCustomerSelect={openDetailModal}
        />
      </div>

      {/* 고객 등록 모달 */}
      <SimpleModal
        isOpen={modalOpen}
        onClose={closeModal}
        onCustomerCreated={handleCustomerCreated}
        initialRoomNo={selectedRoom}
      />
      
      {/* 고객 상세보기 모달 */}
      <CustomerDetailModal 
        isOpen={detailModalOpen} 
        onClose={closeDetailModal} 
        customer={selectedCustomer}
        onCustomerUpdated={handleCustomerCreated}
      />
    </PageLayout>
  );
} 