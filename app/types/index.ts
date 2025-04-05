// 기본 데이터 타입
export interface BaseData {
  memo?: string;
}

// 점포 데이터
export interface StoreData extends BaseData {
  store_id: number;
  store_name: string;
  business_number: string;
  address: string;
  phone_number: string;
  opening_date: string;
}

// 거래처 데이터
export interface VendorData extends BaseData {
  vendor_id: number;
  vendor_name: string;
  business_number: string;
  contact_person: string;
  phone_number: string;
  address: string;
  bank_account?: string;
}

// 매출 데이터
export interface SalesData extends BaseData {
  sales_id: number;
  store_id: number;
  store_name: string;
  sale_date: string;
  amount: number;
  payment_method: string;
}

// 매입 데이터
export interface PurchaseData extends BaseData {
  purchase_id: number;
  store_id: number;
  store_name: string;
  vendor_id: number;
  vendor_name: string;
  purchase_date: string;
  amount: number;
  payment_status: string;
}

// 지출 데이터
export interface ExpenseData extends BaseData {
  expense_id: number;
  store_id: number;
  store_name: string;
  expense_date: string;
  category: string;
  amount: number;
  payment_method: string;
}

// 컬럼 매핑 타입
export type ColumnMapping = {
  [key: string]: string;
}; 