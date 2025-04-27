// 클라이언트 컴포넌트에서 사용 가능한 supabaseClient 내보내기
import { supabaseClient } from '../../utils/supabase-client';
import type { SupabaseClient } from '@supabase/supabase-js';

// 타입 안전성을 위한 가져오기 및 내보내기
// 클라이언트 컴포넌트에서 'supabase' 이름으로 사용
export { supabaseClient };
export const supabase: SupabaseClient = supabaseClient; 