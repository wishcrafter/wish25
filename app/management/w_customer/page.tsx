'use client';

import { useState } from 'react';
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

  // 상단 액션 버튼
  const actions = (
    <div className="flex space-x-2">
      <button 
        className="btn btn-primary"
        onClick={() => setModalOpen(true)}
      >
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
        <div className="filter-container mb-4">
          <div className="flex flex-wrap gap-2">
            {['입실', '퇴실', '예약', '전체'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${statusFilter === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <WCustomerContent
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onCustomerCreated={handleCustomerCreated}
          onLoadingChange={setLoading}
          onErrorChange={setError}
        />
      </div>

      {/* 간단한 모달 */}
      <SimpleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </PageLayout>
  );
} 