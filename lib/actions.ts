'use server';

import { cookies } from 'next/headers';

interface LoginResult {
  success: boolean;
  message?: string;
}

/**
 * 로그인 함수
 * 입력된 비밀번호를 환경 변수에 저장된 비밀번호와 비교하여 인증을 수행
 */
export async function login(password: string): Promise<LoginResult> {
  console.log('로그인 함수 실행 - 비밀번호 확인 중');
  
  // 하드코딩된 비밀번호로 먼저 시도
  const hardcodedPassword = "1234";
  
  // 환경 변수에서 비밀번호 가져오기
  const envPassword = process.env.AUTH_PASSWORD;
  
  console.log('입력된 비밀번호:', password);
  console.log('하드코딩 비밀번호:', hardcodedPassword);
  console.log('환경 변수 비밀번호:', envPassword);
  
  // 하드코딩된 비밀번호와 환경 변수 비밀번호 둘 중 하나라도 일치하면 로그인 성공
  const isPasswordCorrect = 
    password === hardcodedPassword || 
    (envPassword && password === envPassword);
  
  console.log('비밀번호 일치 여부:', isPasswordCorrect);

  if (isPasswordCorrect) {
    // 인증 성공 시 쿠키 설정
    try {
      const cookieStore = await cookies();
      console.log('쿠키 설정 시작');
      
      // 기존 쿠키 제거 후 재설정
      await cookieStore.delete('auth');
      
      // 쿠키 설정
      await cookieStore.set({
        name: 'auth',
        value: 'ok',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7일 동안 유효
      });
      
      console.log('쿠키 설정 완료');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('쿠키 설정 중 오류 발생:', error);
      return {
        success: false,
        message: '로그인 처리 중 오류가 발생했습니다.'
      };
    }
  }

  return {
    success: false,
    message: '비밀번호가 일치하지 않습니다.'
  };
}

/**
 * 로그아웃 함수
 * 인증 쿠키를 삭제
 */
export async function logout() {
  try {
    const cookieStore = await cookies();
    await cookieStore.delete('auth');
    console.log('로그아웃 완료 - 쿠키 삭제됨');
    return {
      success: true
    };
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    return {
      success: false,
      message: '로그아웃 처리 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 인증 상태 확인 함수
 * 쿠키를 확인하여 로그인 상태를 반환
 */
export async function getAuthStatus(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = await cookieStore.get('auth');
    console.log('인증 상태 확인 - 쿠키 값:', authCookie?.value);
    return authCookie?.value === 'ok';
  } catch (error) {
    console.error('인증 상태 확인 중 오류 발생:', error);
    return false;
  }
} 