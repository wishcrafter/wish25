'use client';

import dynamic from 'next/dynamic';
import PageLayout from '@/app/components/PageLayout';
import { useRef } from 'react';

const PurchasesContent = dynamic(() => import('./components/PurchasesContent'), {
  ssr: false,
  loading: () => null
});

export default function PurchasesPage() {
  // openRegisterModal을 PurchasesContent에서 받아서 actions로 넘기기 위한 ref
  const contentRef = useRef<any>(null);
  const handleOpenRegister = () => {
    if (contentRef.current && contentRef.current.openRegisterModal) {
      contentRef.current.openRegisterModal();
    }
  };
  return (
    <PageLayout
      title="매입 관리"
      actions={
        <button className="btn btn-primary" style={{ minWidth: 110, fontWeight: 600, fontSize: '1rem', borderRadius: 6, boxShadow: '0 2px 8px rgba(49,130,206,0.08)' }} onClick={handleOpenRegister}>
          매입 등록
        </button>
      }
    >
      <PurchasesContent ref={contentRef} />
    </PageLayout>
  );
} 