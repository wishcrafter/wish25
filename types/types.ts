// 고객 데이터 인터페이스
export interface CustomerData {
  id: number;
  created_at: string;
  updated_at: string;
  room_no: number;
  name: string;
  deposit: number;
  monthly_fee: number;
  first_fee: number;
  move_in_date: string | null;
  move_out_date: string | null;
  status: string;
  memo: string;
  resident_id: string;
  phone: string;
  phone_sub: string;
  address: string;
}

// 고객 생성/수정 시 사용하는 폼 데이터 인터페이스
export interface CustomerFormData {
  room_no: number | null;
  name: string;
  deposit: number;
  monthly_fee: number;
  first_fee: number;
  move_in_date: string | null;
  move_out_date: string | null;
  status: string;
  memo: string | null;
  resident_id: string | null;
  phone: string | null;
  phone_sub: string | null;
  address: string | null;
}

// 고객 테이블 컬럼 정의
export interface CustomerColumn {
  key: keyof CustomerData;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string | number;
}

// 생성 전용 타입 정의
export type NewCustomerInput = Omit<
  CustomerData,
  'id' | 'created_at' | 'updated_at'
>; 