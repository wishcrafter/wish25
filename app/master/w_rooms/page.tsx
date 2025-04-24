'use client';

import WRoomsContent from './components/WRoomsContent';
import PageLayout from '@/components/PageLayout';
import { useState } from 'react';

export default function WRoomsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <PageLayout 
      title="스튜디오 방 정보"
      isLoading={loading}
      error={error}
    >
      <WRoomsContent 
        onLoadingChange={setLoading}
        onErrorChange={setError}
      />
    </PageLayout>
  );
} 