'use client';

import dynamic from 'next/dynamic';

const PurchasesContent = dynamic(() => import('./PurchasesContent'), {
  ssr: false,
  loading: () => <div className="loading-state">Loading...</div>
});

export default function ClientWrapper() {
  return <PurchasesContent />;
} 