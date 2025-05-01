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
    <div className="min-h-screen bg-gray-100">
      <div className="px-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {actions && <div className="flex space-x-3">{actions}</div>}
          </div>

          <div className="bg-white shadow rounded-lg">
            {error ? (
              <div className="p-4 text-red-600">
                <h3 className="font-semibold">에러 발생:</h3>
                <p>{error}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 