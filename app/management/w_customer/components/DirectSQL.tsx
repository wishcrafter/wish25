'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

interface DirectSQLProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function DirectSQL({ onClose, onSuccess }: DirectSQLProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createTableDirectly = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // 테이블 생성 직접 SQL 쿼리 실행
      const { error: createTableError } = await supabase.rpc('exec_sql', { 
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.w_customers (
            id serial PRIMARY KEY,
            room_no integer,
            name varchar,
            deposit integer,
            monthly_fee integer,
            first_fee integer,
            move_in_date date,
            move_out_date date,
            status varchar,
            memo text,
            resident_id varchar,
            phone varchar,
            phone_sub varchar,
            address varchar,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );

          -- RLS 정책 설정
          ALTER TABLE public.w_customers ENABLE ROW LEVEL SECURITY;

          -- 인증된 사용자에게 모든 권한 허용
          DO
          $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_policies 
              WHERE tablename = 'w_customers' 
              AND schemaname = 'public' 
              AND policyname = 'Enable all access for authenticated users'
            ) THEN
              CREATE POLICY "Enable all access for authenticated users" ON public.w_customers
                FOR ALL
                USING (auth.role() = 'authenticated')
                WITH CHECK (auth.role() = 'authenticated');
            END IF;
          END
          $$;

          -- 테이블에 대한 기본 권한 설정
          GRANT ALL ON TABLE public.w_customers TO postgres;
          GRANT ALL ON TABLE public.w_customers TO anon;
          GRANT ALL ON TABLE public.w_customers TO authenticated;
          GRANT ALL ON TABLE public.w_customers TO service_role;

          -- 시퀀스에 대한 권한 설정
          GRANT USAGE, SELECT ON SEQUENCE public.w_customers_id_seq TO postgres;
          GRANT USAGE, SELECT ON SEQUENCE public.w_customers_id_seq TO anon;
          GRANT USAGE, SELECT ON SEQUENCE public.w_customers_id_seq TO authenticated;
          GRANT USAGE, SELECT ON SEQUENCE public.w_customers_id_seq TO service_role;
        `
      });

      if (createTableError) {
        throw createTableError;
      }

      setSuccess(true);
      
      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('직접 SQL로 테이블 생성 중 오류 발생:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-table-container direct-sql">
      <h3>SQL 직접 실행으로 테이블 생성</h3>
      <p>위 방법이 실패한 경우, SQL을 직접 실행하여 'w_customers' 테이블을 생성할 수 있습니다.</p>
      <p className="note">참고: 이 방법을 사용하려면 Supabase에 'exec_sql' 함수가 이미 생성되어 있어야 합니다.</p>
      
      {success && (
        <div className="success-message">
          <p>SQL이 성공적으로 실행되었습니다. 페이지를 새로고침하면 데이터를 확인할 수 있습니다.</p>
          <button 
            className="btn btn-primary"
            onClick={() => onClose ? onClose() : window.location.reload()}
          >
            페이지 새로고침
          </button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>SQL 실행 중 오류가 발생했습니다:</p>
          <code>{error}</code>
        </div>
      )}
      
      <button 
        className="btn btn-secondary"
        onClick={createTableDirectly}
        disabled={loading || success}
      >
        {loading ? 'SQL 실행 중...' : 'SQL 직접 실행하기'}
      </button>
    </div>
  );
} 