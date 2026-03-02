/**
 * 전화번호 입력 시 하이픈 자동 포맷 (010-1234-5678, 02-1234-5678 등)
 * @param {string} value - 입력값 (숫자 또는 이미 포맷된 문자열)
 * @returns {string} 하이픈이 삽입된 표시용 문자열
 */
export function formatPhoneDisplay(value) {
  let digits = (value || '').replace(/\D/g, '');
  if (digits.startsWith('02')) digits = digits.slice(0, 10);
  else if (digits.startsWith('010')) digits = digits.slice(0, 11);
  else digits = digits.slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.startsWith('02')) {
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.startsWith('010')) {
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}
