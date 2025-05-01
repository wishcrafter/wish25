/**
 * 금액을 한국어 형식으로 포맷팅합니다.
 * @param amount 포맷팅할 금액
 * @returns 포맷팅된 금액 문자열 (예: "1,000,000")
 */
export const formatAmount = (amount: number | null | undefined): string => {
  if (amount == null) return '-';
  return amount.toLocaleString('ko-KR');
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 * @param date 포맷팅할 날짜 (Date 객체 또는 날짜 문자열)
 * @returns 포맷팅된 날짜 문자열 (예: "2024-03-14")
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * 빈 값을 처리합니다.
 * @param value 확인할 값
 * @returns 값이 없을 경우 '-', 있을 경우 해당 값을 문자열로 반환
 */
export const formatEmptyValue = (value: any): string => {
  if (value == null || value === '') return '-';
  return String(value);
}; 