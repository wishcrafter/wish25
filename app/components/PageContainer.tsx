'use client';

interface PageContainerProps {
  title: string;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function PageContainer({
  title,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyMessage = '데이터가 없습니다.',
  children
}: PageContainerProps) {
  return (
    <div className="page-container">
      <h1 className="page-title">{title}</h1>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading-state">데이터를 불러오는 중...</div>
      ) : isEmpty ? (
        <div className="empty-state">{emptyMessage}</div>
      ) : (
        children
      )}
    </div>
  );
} 