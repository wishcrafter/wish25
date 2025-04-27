# 위시크래프터 정산 관리 시스템

정산 관리 시스템은 위시크래프터 회사의 정산 작업을 효율적으로 관리하기 위한 웹 애플리케이션입니다.

## 환경 변수 설정

이 프로젝트는 보안을 위해 환경 변수를 사용합니다. Vercel에 배포할 때 다음 환경 변수를 설정해야 합니다:

### 서버 측에서만 접근 가능한 환경 변수 (민감한 정보)

```
# 로그인 비밀번호
PASSWORD=your_secure_password

# Supabase 서버 측 접근용 (보안이 필요한 작업)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 클라이언트에서 접근 가능한 환경 변수 (공개 데이터만)

```
# Supabase 클라이언트 측 접근용 (읽기 전용 작업)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 로컬 개발 환경 설정

로컬에서 개발할 때는 `.env.local` 파일에 위의 환경 변수를 설정하세요. 이 파일은 Git에 커밋되지 않습니다.

## 배포 방법

1. GitHub에 코드를 푸시합니다.
2. Vercel 프로젝트를 설정합니다.
3. Vercel 환경 변수 섹션에서 위의 환경 변수를 설정합니다.
4. 배포를 진행합니다. 