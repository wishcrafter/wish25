'use client';

import dynamic from 'next/dynamic';
import PageLayout from '@/app/components/PageLayout';

// CSR을 위한 동적 임포트
const DashboardContent = dynamic(() => import('./components/DashboardContent'), {
  ssr: false,
  loading: () => null
});

export default function DashboardPage() {
  return (
    <PageLayout title="대시보드">
      <DashboardContent />
    </PageLayout>
  );
} 