'use client';

import PageLayout from '@/app/components/PageLayout';

export default function ManagementPage() {
  return (
    <PageLayout title="관리">
      <div className="welcome-message">
        <h2>관리 메뉴에 오신 것을 환영합니다</h2>
        <p>왼쪽 사이드바에서 관리할 항목을 선택하세요.</p>
      </div>
    </PageLayout>
  );
}
