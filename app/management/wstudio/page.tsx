'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '@/components/PageLayout';

// CSR을 위한 동적 임포트
const WStudioContent = dynamic(() => import('./components/WStudioContent'), {
  ssr: false,
  loading: () => null
});

export default function WStudioPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 저장 함수 레퍼런스 저장
  const saveFnRef = useRef<(() => Promise<boolean | void>) | null>(null);
  
  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    if (saveFnRef.current) {
      setIsSaving(true);
      try {
        await saveFnRef.current();
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // 저장 버튼 렌더링
  const ActionButtons = (
    <button 
      className="btn btn-primary"
      onClick={handleSave}
      disabled={isSaving || !hasChanges}
    >
      {isSaving ? '저장 중...' : hasChanges ? `저장 (${hasChanges})` : '저장'}
    </button>
  );
  
  // 저장 함수 변경 핸들러
  const handleSaveFnChange = useCallback((fn: () => Promise<boolean | void>) => {
    saveFnRef.current = fn;
  }, []);

  return (
    <PageLayout 
      title="스튜디오 매출 관리"
      isLoading={loading}
      error={error}
      actions={ActionButtons}
    >
      <WStudioContent 
        onLoadingChange={setLoading}
        onErrorChange={setError}
        onSaveFnChange={handleSaveFnChange}
        onHasChangesChange={setHasChanges}
        isSaving={isSaving}
      />
    </PageLayout>
  );
} 