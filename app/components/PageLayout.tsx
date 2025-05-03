'use client';

import React, { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  isLoading?: boolean;
  error?: string | null;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function PageLayout({
  title,
  isLoading = false,
  error = null,
  actions,
  children,
  className = ''
}: PageLayoutProps) {
      return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {actions && <div className="page-actions">{actions}</div>}
      </div>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="bg-white rounded-lg p-4 text-red-600">
              <h3 className="font-semibold">에러 발생:</h3>
          <p>{error}</p>
          <button 
                className="btn btn-primary mt-2"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
          ) : (
            <div className="relative">
        {children}
        {isLoading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
          )}
        </div>
      </div>
    </div>
  );
} 