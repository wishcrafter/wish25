// 고객 데이터 인터페이스
export interface CustomerData {
  id: string;               // UUID
  room_no: number | null;   // 방 번호
  name: string;            // 고객명
  deposit: number;         // 보증금
  monthly_fee: number;     // 월세
  first_fee: number;       // 초기 비용
  move_in_date: string | null;   // 입실일
  move_out_date: string | null;  // 퇴실일
  status: string;          // 상태 (입실/퇴실)
  memo: string | null;     // 메모
  resident_id: string | null;    // 주민번호
  phone: string | null;    // 연락처
  phone_sub: string | null;      // 보조 연락처
  address: string | null;  // 주소
  created_at: string;     // 생성일
  updated_at: string;     // 수정일
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