'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 로그인 페이지 접속 시 바로 홈으로 리디렉션
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center" 
         style={{ 
           background: 'linear-gradient(180deg, #4a6cf7 0%, #2c3e50 100%)' 
         }}>
      <div className="w-full max-w-md px-8 py-10 mx-4 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">주식회사 위시크래프터</h1>
          <p className="text-lg text-gray-600">정산관리 시스템</p>
        </div>
        <p className="text-center">메인 페이지로 이동 중...</p>
      </div>
    </div>
  );
} 