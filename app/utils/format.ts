// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

// 금액 포맷팅
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

// 빈 값 처리
export const formatEmptyValue = (value: string | null | undefined): string => {
  return value || '-';
}; 