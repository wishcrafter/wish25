import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 연결 정보를 가져오거나 기본값 사용
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erzptwslcjigyptwfzku.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenB0d3NsY2ppZ3lwdHdmemt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk0MjYwNzUsImV4cCI6MjAxNTAwMjA3NX0.vfgH1D0p1qFaVSPzCm41UunvJIu-wZUWBxQj-zAKhMs';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 참고: 다른 PC에서 사용할 경우 .env.local 파일에 다음 내용 추가 필요
// NEXT_PUBLIC_SUPABASE_URL=https://erzptwslcjigyptwfzku.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenB0d3NsY2ppZ3lwdHdmemt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk0MjYwNzUsImV4cCI6MjAxNTAwMjA3NX0.vfgH1D0p1qFaVSPzCm41UunvJIu-wZUWBxQj-zAKhMs 