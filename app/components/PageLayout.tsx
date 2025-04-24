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
  const renderContent = () => {
    if (error) {
      return (
        <div className="error-state">
          <h3>에러 발생:</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      );
    }
    
    return (
      <div className="page-content relative">
        {children}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`page-container ${className}`}>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {actions && <div className="page-actions">{actions}</div>}
      </div>

      {renderContent()}

      <style jsx>{`
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          pointer-events: none;
        }
        
        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .relative {
          position: relative;
        }
      `}</style>
    </div>
  );
} 