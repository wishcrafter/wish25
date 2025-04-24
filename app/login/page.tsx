'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { login } from '@/lib/actions';
import LoadingAnimation from '@/app/components/LoadingAnimation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 페이지 로드 시 입력 필드에 포커스
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 로그인 상태가 변경될 때 리디렉션 처리
  useEffect(() => {
    if (isLoggedIn && !redirect) {
      setRedirect(true);
      // 애니메이션이 완료된 후 홈페이지로 이동
      const timer = setTimeout(() => {
        router.push('/');
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 비밀번호 앞뒤 공백 제거
      const trimmedPassword = password.trim();
      console.log('로그인 시도:', trimmedPassword);
      
      const result = await login(trimmedPassword);
      console.log('로그인 결과:', result);
      
      if (result.success) {
        setIsLoggedIn(true);
        console.log('로그인 성공, 리디렉션 준비 중...');
      } else {
        setError(result.message || '비밀번호가 올바르지 않습니다');
        console.log('로그인 실패:', result.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('로그인 중 오류가 발생했습니다:', err);
      setError('로그인 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" 
         style={{ 
           background: 'linear-gradient(180deg, var(--sidebar-color-1) 0%, var(--sidebar-color-2) 100%)' 
         }}>
      <motion.div 
        className="w-full max-w-md px-8 py-10 mx-4 bg-white rounded-lg shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">주식회사 위시크래프터</h1>
          <p className="text-lg text-gray-600">정산관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              ref={inputRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 입력해주세요"
              disabled={isLoading || isLoggedIn}
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isLoggedIn}
            className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
              isLoading || isLoggedIn
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingAnimation type="spinner" size="sm" color="light" />
                <span className="ml-2">로그인 중...</span>
              </div>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {isLoggedIn && (
          <div className="mt-4 text-center">
            <LoadingAnimation type="dots" size="md" color="primary" text="메인 페이지로 이동 중..." />
          </div>
        )}
      </motion.div>
    </div>
  );
} 