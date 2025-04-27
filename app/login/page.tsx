'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        sessionStorage.setItem('isLoggedIn', 'true');
        Cookies.set('isLoggedIn', 'true', { expires: 1 });
        router.push('/');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
        setPassword('');
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-title">
        <h1 className="company-name">주식회사 위시크래프터</h1>
        <h2 className="system-name">정산 관리 시스템</h2>
        <p className="english-name">Wiscrafter Corp. Settlement Management System</p>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="password-input"
            autoFocus
          />
          <div className="error-container">
            {error && <p className="error-message">{error}</p>}
          </div>
          <button 
            type="submit" 
            className="login-button"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
} 