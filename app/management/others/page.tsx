'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '@/app/components/PageLayout';

// CSR을 위한 동적 임포트
const OthersContent = dynamic(() => import('./components/OthersContent'), {
  ssr: false,
  loading: () => null
});

export default function OthersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModalFn, setOpenModalFn] = useState<(() => void) | null>(null);
  
  // useCallback을 사용해 함수 참조 안정화
  const handleOpenModalFnChange = useCallback((fn: () => void) => {
    setOpenModalFn(() => fn);
  }, []);

  return (
    <PageLayout 
      title="기타 비용 관리"
      isLoading={loading}
      error={error}
      actions={
        <button 
          className="btn btn-primary"
          onClick={() => openModalFn && openModalFn()}
        >
          기타 비용 등록
        </button>
      }
      className="others-page"
    >
      <OthersContent 
        onLoadingChange={setLoading}
        onErrorChange={setError}
        onOpenModalFnChange={handleOpenModalFnChange}
      />
    </PageLayout>
  );
} 