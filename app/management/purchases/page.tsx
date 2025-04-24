'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '@/components/PageLayout';

// CSR을 위한 동적 임포트
const PurchasesContent = dynamic(() => import('./components/PurchasesContent'), {
  ssr: false,
  loading: () => null
});

export default function PurchasesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [openModalFn, setOpenModalFn] = useState<(() => void) | null>(null);
  
  // 저장 함수 레퍼런스 저장
  const savePurchasesRef = useRef<(() => Promise<boolean | void>) | null>(null);
  
  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    if (savePurchasesRef.current) {
      setIsSaving(true);
      try {
        await savePurchasesRef.current();
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // 매입 등록 모달 버튼 렌더링
  const ActionButtons = (
    <button 
      className="btn btn-primary"
      onClick={() => openModalFn && openModalFn()}
    >
      매입 등록
    </button>
  );

  return (
    <>
      <style jsx global>{`
        /* 점포별 카드 스타일 - sales 페이지와 일치 */
        .store-summary {
          margin-bottom: 16px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        
        .store-total-card {
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
          min-height: 150px;
          width: auto;
          max-width: none;
          margin-bottom: 0;
          overflow: visible; /* 계좌번호가 카드 밖으로 나갈 수 있도록 설정 */
        }
        
        .store-total-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          border-color: #2563eb;
          background: #fff;
          z-index: 10; /* 호버 시 다른 카드 위에 표시 */
        }
        
        .store-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .store-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          min-height: 100px;
        }
        
        /* 거래처명과 금액 행 스타일 */
        .amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          line-height: 1.2;
          padding: 2px 0;
          position: relative;
        }
        
        .amount-row.vendor {
          display: flex;
          align-items: center;
          position: relative;
        }
        
        .amount-label {
          color: #64748b;
          font-weight: 500;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .amount-value {
          color: #334155;
          font-weight: 600;
          margin-left: 4px;
          flex: 0 0 auto;
          white-space: nowrap;
          font-feature-settings: "tnum";
          font-variant-numeric: tabular-nums;
        }
        
        /* 계좌번호 표시 스타일 - 우측으로 확장 */
        .bank-account-container {
          visibility: hidden;
          position: absolute;
          left: calc(100% + 4px);
          top: 0;
          background-color: #f8f9fa;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          white-space: nowrap;
          color: #64748b;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.2s ease;
          z-index: 5;
        }
        
        .amount-row.vendor:hover .bank-account-container {
          visibility: visible;
          opacity: 1;
          transform: translateX(0);
        }
        
        /* 거래건수 행 스타일 */
        .amount-row.transactions {
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px dashed #e2e8f0;
        }
        
        .amount-row:first-child .amount-value,
        .amount-row.transactions .amount-value {
          color: #2563eb;
        }
        
        /* 로딩 인디케이터 스타일 */
        .minimal-loading-state, .minimal-loading-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .loading-spinner, .loading-spinner-small {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
        }
        
        .loading-spinner-small {
          width: 20px;
          height: 20px;
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 100;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <PageLayout 
        title="매입 관리"
        isLoading={loading && !hasChanges}
        error={error}
        actions={ActionButtons}
        className="purchases-page"
      >
        <PurchasesContent 
          onLoadingChange={setLoading}
          onErrorChange={setError}
          onSaveFnChange={(fn: () => Promise<boolean | void>) => {
            savePurchasesRef.current = fn;
          }}
          onHasChangesChange={setHasChanges}
          isSaving={isSaving}
          onOpenModalFnChange={(fn: () => void) => {
            setOpenModalFn(() => fn);
          }}
        />
      </PageLayout>
    </>
  );
} 