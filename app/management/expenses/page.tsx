'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageLayout from '@/components/PageLayout';

// CSR을 위한 동적 임포트
const ExpensesContent = dynamic(() => import('./components/ExpensesContent'), {
  ssr: false,
  loading: () => null
});

export default function ExpensesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 저장 함수 레퍼런스 저장
  const saveExpensesRef = useRef<(() => Promise<boolean | void>) | null>(null);
  
  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    if (saveExpensesRef.current) {
      setIsSaving(true);
      try {
        await saveExpensesRef.current();
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
      {isSaving ? '저장 중...' : '저장'}
    </button>
  );

  return (
    <PageLayout 
      title="고정 비용 관리"
      isLoading={loading}
      error={error}
      actions={ActionButtons}
      className="expenses-page"
    >
      <ExpensesContent 
        onLoadingChange={setLoading}
        onErrorChange={setError}
        onSaveFnChange={(fn: () => Promise<boolean | void>) => {
          saveExpensesRef.current = fn;
        }}
        onHasChangesChange={setHasChanges}
        isSaving={isSaving}
      />
    </PageLayout>
  );
} 