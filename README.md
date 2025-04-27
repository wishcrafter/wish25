# 위시크래프터 정산 관리 시스템

정산 업무를 효율적으로 관리하기 위한 웹 애플리케이션입니다.

## 환경 변수 설정 방법

이 프로젝트는 다음과 같은 환경 변수를 사용합니다:

### 로컬 개발 환경 (.env.local 파일)

다음 환경 변수를 `.env.local` 파일에 설정해야 합니다. **주의: 모든 값이 한 줄에 작성되어야 합니다.**

```
PASSWORD=1234

# Supabase 클라이언트용 환경 변수 (NEXT_PUBLIC_ 접두사 필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase 서버용 환경 변수 (서버에서만 사용)
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Vercel 배포 환경

Vercel 대시보드에서 프로젝트 설정 > 환경 변수에 다음을 추가해야 합니다:

1. `PASSWORD` - 관리자 로그인 비밀번호
2. `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키 (클라이언트용)
4. `SUPABASE_URL` - Supabase 프로젝트 URL (서버용)
5. `SUPABASE_SERVICE_KEY` - Supabase 서비스 키 (서버용, 이미지의 SUPABASE_SERVICE_KEY)

**중요: Vercel에서는 환경 변수 이름이 정확히 일치해야 합니다. 특히 서비스 키는 `SUPABASE_SERVICE_KEY`로 설정되어야 합니다.**

## 로컬 개발 시작하기

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 시작:
```bash
npm run dev
```

3. http://localhost:3000 에서 애플리케이션에 접속

## 배포하기

1. Vercel에 환경 변수를 설정합니다.
2. GitHub 저장소를 Vercel에 연결하고 배포합니다.
3. 변경사항을 GitHub에 푸시할 때마다 자동으로 배포됩니다.

## 문제 해결

### Supabase 연결 오류

- "클라이언트 초기화 실패, 서버 API를 통해 작업합니다" 메시지가 나타나면:
  1. 환경 변수가 올바르게 설정되었는지 확인하세요.
  2. Vercel에서 환경 변수가 모두 정확한 이름으로 추가되었는지 확인하세요.
  3. Supabase 프로젝트가 활성 상태인지 확인하세요. 