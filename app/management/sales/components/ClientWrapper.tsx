'use client';

import dynamic from 'next/dynamic';

const SalesContent = dynamic(() => import('./SalesContent'), {
  ssr: false,
  loading: () => <div className="loading-state">Loading...</div>
});

export default function ClientWrapper() {
  return <SalesContent />;
} 