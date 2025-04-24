'use client';

import React from 'react';

interface LoadingAnimationProps {
  type?: 'spinner' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'light' | 'dark';
  text?: string;
}

export default function LoadingAnimation({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  text,
}: LoadingAnimationProps) {
  // 크기 클래스 계산
  const sizeClass = {
    sm: type === 'spinner' ? 'w-4 h-4' : 'h-2 w-2',
    md: type === 'spinner' ? 'w-8 h-8' : 'h-3 w-3',
    lg: type === 'spinner' ? 'w-12 h-12' : 'h-4 w-4',
  }[size];

  // 색상 클래스 계산
  const colorClass = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    light: 'text-white',
    dark: 'text-gray-800',
  }[color];

  // 스피너 타입 렌더링
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center flex-col ${text ? 'gap-2' : ''}`}>
        <div className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClass} ${colorClass}`} role="status" aria-label="로딩 중">
          <span className="sr-only">로딩 중...</span>
        </div>
        {text && <span className={`text-sm ${colorClass}`}>{text}</span>}
      </div>
    );
  }

  // 도트 타입 렌더링
  return (
    <div className="flex items-center justify-center flex-col gap-2">
      <div className="flex space-x-2 justify-center items-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${sizeClass} ${colorClass} rounded-full animate-bounce`}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
      {text && <span className={`text-sm ${colorClass}`}>{text}</span>}
    </div>
  );
} 