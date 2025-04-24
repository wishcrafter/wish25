-- w_customers 테이블 생성 함수
CREATE OR REPLACE FUNCTION public.create_w_customers_table()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
BEGIN
  -- 이미 테이블이 존재하는지 확인
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'w_customers') THEN
    RETURN;
  END IF;

  -- w_customers 테이블 생성
  CREATE TABLE public.w_customers (
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
  CREATE POLICY "Enable all access for authenticated users" ON public.w_customers
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
    
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
END;
$$; 