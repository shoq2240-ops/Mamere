/**
 * 배송비 정책: 3만원 이상 주문 시 무료배송, 미만 시 기본 배송비
 */
export const FREE_SHIPPING_THRESHOLD = 30000; // 원
export const DEFAULT_SHIPPING_FEE = 3000;     // 원

/**
 * 주문 금액(소계)에 따른 배송비 계산
 * @param {number} subtotal - 상품 소계 (원)
 * @returns {number} 배송비 (원)
 */
export const getShippingFee = (subtotal) => {
  const s = Number(subtotal);
  if (Number.isNaN(s) || s < 0) return DEFAULT_SHIPPING_FEE;
  return s >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
};

/**
 * 무료배송까지 남은 금액 (이미 무료면 0)
 * @param {number} subtotal - 상품 소계 (원)
 * @returns {number} 남은 금액 (원)
 */
export const getRemainingForFreeShipping = (subtotal) => {
  const s = Number(subtotal);
  if (Number.isNaN(s) || s < 0 || s >= FREE_SHIPPING_THRESHOLD) return 0;
  return FREE_SHIPPING_THRESHOLD - s;
};
