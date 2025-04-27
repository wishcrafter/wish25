// 클라이언트 컴포넌트에서 사용 가능한 supabaseClient 내보내기
import { supabaseClient } from '../../utils/supabase-client';

export { supabaseClient };
export const supabase = supabaseClient; 