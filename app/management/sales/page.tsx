'use client';

import dynamic from 'next/dynamic';
import PageLayout from '@/app/components/PageLayout';

// CSR을 위한 동적 임포트
const SalesContent = dynamic(() => import('./components/SalesContent'), {
  ssr: false,
  loading: () => null
});

export default function SalesPage() {
  return (
    <PageLayout title="매출 관리">
      <SalesContent />
    </PageLayout>
  );
}