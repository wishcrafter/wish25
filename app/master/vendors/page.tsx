'use client';

import dynamic from 'next/dynamic';
import PageLayout from '@/components/PageLayout';

// CSR을 위한 동적 임포트
const VendorsContent = dynamic(() => import('../components/VendorsContent'), {
  ssr: false,
  loading: () => null
});

export default function VendorsPage() {
  return (
    <PageLayout title="거래처 정보">
      <VendorsContent />
    </PageLayout>
  );
}