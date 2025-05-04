'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/app/components/PageLayout';
import WCustomerContent from './components/WCustomerContent';
import SimpleModal from './components/SimpleModal';

export default function WCustomerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('입실');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // 고객 등록 완료 후 새로고침 트리거
  const handleCustomerCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 상태 필터 변경 핸들러
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // 상단 액션 버튼
  const actions = (
    <div className="flex space-x-2">
      <button 
        className="btn btn-primary flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        onClick={() => setModalOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        고객 등록
      </button>
    </div>
  );

  return (
    <PageLayout 
      title="스튜디오 고객 관리"
      actions={actions}
      error={error}
    >
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
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500 ring-offset-2' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        />
      </div>

      {/* 고객 등록 모달 */}
      <SimpleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </PageLayout>
  );
} 