/**
 * 상품 재고/품절 관련 유틸리티
 *
 * [품절 판정 로직]
 * - stock_quantity가 0 이하 → 자동 품절 (재고 소진)
 * - is_manual_soldout이 true → 수동 품절 (관리자가 판매 중단 설정)
 * 두 조건 중 하나라도 해당되면 품절로 간주합니다.
 *
 * [컬럼 설명]
 * - stock_quantity: 재고 개수 (Integer, 기본값 0) - 결제 시 차감
 * - is_manual_soldout: 관리자 수동 품절 스위치 (Boolean, 기본값 false)
 */

/**
 * 상품이 품절 상태인지 판정합니다.
 * (재고 0 이하) OR (수동 품절 ON) 이면 품절로 간주합니다.
 *
 * @param {Object} product - 상품 객체 { stock_quantity?, is_manual_soldout? }
 * @returns {boolean} 품절 여부
 */
export function isSoldOut(product) {
  if (!product) return true;
  const stock = product.stock_quantity ?? 0;
  const manualSoldOut = product.is_manual_soldout === true;
  return stock <= 0 || manualSoldOut;
}

/**
 * 상품의 현재 재고 수량을 반환합니다.
 * @param {Object} product - 상품 객체
 * @returns {number}
 */
export function getStockQuantity(product) {
  if (!product) return 0;
  const qty = product.stock_quantity ?? product.stock ?? 0;
  return Math.max(0, Math.floor(Number(qty)) || 0);
}
