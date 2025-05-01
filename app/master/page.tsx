'use client';

import dynamic from 'next/dynamic';
import PageLayout from '@/app/components/PageLayout';

// CSR을 위한 동적 임포트
const StoresContent = dynamic(() => import('./components/StoresContent'), {
  ssr: false,
  loading: () => null
});

export default function MasterPage() {
  return (
    <PageLayout title="기준정보 관리">
      <StoresContent />
    </PageLayout>
  );
} 