'use client';

import WCustomerContent from './components/WCustomerContent';
import PageLayout from '@/app/components/PageLayout';
import { useState } from 'react';
import CustomerRegisterModal from './components/CustomerRegisterModal';

export default function WCustomerPage() {
  const [statusFilter, setStatusFilter] = useState<string>('입실');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 고객 등록 모달 열기
  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  // 고객 등록 모달 닫기
  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  // 상단 액션 버튼
  const actions = (
    <button 
      className="btn btn-primary"
      onClick={openRegisterModal}
    >
      고객 등록
    </button>
  );

  return (
    <PageLayout 
      title="스튜디오 고객 관리"
      actions={actions}
      isLoading={loading}
      error={error}
      className="w-customer-page"
    >
      <div className="w-customer-content">
        <div className="filter-container">
          <div className="filter-label">상태 필터:</div>
          <div className="filter-options">
            <button 
              className={`filter-btn ${statusFilter === '전체' ? 'active' : ''}`}
              onClick={() => setStatusFilter('전체')}
            >
              전체
            </button>
            <button 
              className={`filter-btn ${statusFilter === '입실' ? 'active' : ''}`}
              onClick={() => setStatusFilter('입실')}
            >
              입실
            </button>
            <button 
              className={`filter-btn ${statusFilter === '퇴실' ? 'active' : ''}`}
              onClick={() => setStatusFilter('퇴실')}
            >
              퇴실
            </button>
            <button 
              className={`filter-btn ${statusFilter === '예약' ? 'active' : ''}`}
              onClick={() => setStatusFilter('예약')}
            >
              예약
            </button>
          </div>
        </div>
        
        <WCustomerContent 
          statusFilter={statusFilter} 
          onCustomerCreated={closeRegisterModal}
          onLoadingChange={setLoading}
          onErrorChange={setError}
        />

        {/* 고객 등록 모달 */}
        {isRegisterModalOpen && (
          <CustomerRegisterModal
            onClose={closeRegisterModal}
            onCustomerCreated={closeRegisterModal}
          />
        )}
      </div>

      <style jsx>{`
        .w-customer-page {
          padding: 0;
          margin: 0;
          width: 100%;
        }

        .w-customer-content {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .filter-container {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .filter-label {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .filter-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background: white;
          color: #4a5568;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: #f7fafc;
        }

        .filter-btn.active {
          background: #4299e1;
          color: white;
          border-color: #4299e1;
        }
      `}</style>
    </PageLayout>
  );
} 