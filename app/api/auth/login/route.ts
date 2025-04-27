import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // 환경 변수에서 비밀번호 확인 (서버 사이드 전용)
    // 하드코딩된 비밀번호(1234)도 허용
    if (password === process.env.PASSWORD || password === "1234") {
      return NextResponse.json({ success: true });
    } else {
      console.log('비밀번호 불일치. 입력:', password, '환경변수:', process.env.PASSWORD);
      return NextResponse.json(
        { success: false, message: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 