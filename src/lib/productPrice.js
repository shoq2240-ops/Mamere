/**
 * 상품 가격(판매가·정가/세일) 헬퍼
 * - price: 실제 결제가 (표시용 문자열 또는 숫자)
 * - compare_at_price: 정가(할인 전). null이면 세일 아님
 */

export function parsePriceToNumber(price) {
  if (price == null || price === '') return null;
  if (typeof price === 'number' && !Number.isNaN(price)) return price;
  if (typeof price === 'string') {
    const n = parseInt(price.replace(/\D/g, ''), 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function getCompareAtNumber(product) {
  const v = product?.compare_at_price;
  if (v == null || v === '') return null;
  if (typeof v === 'number' && !Number.isNaN(v)) return v > 0 ? v : null;
  const n = parseInt(String(v).replace(/\D/g, ''), 10);
  return Number.isNaN(n) || n <= 0 ? null : n;
}

export function isProductOnSale(product) {
  const sale = parsePriceToNumber(product?.price);
  const compare = getCompareAtNumber(product);
  if (sale == null || compare == null) return false;
  return compare > sale;
}

/** 0~100 정수 할인율 (표시용), 세일 아니면 null */
export function getDiscountPercentRounded(product) {
  if (!isProductOnSale(product)) return null;
  const sale = parsePriceToNumber(product.price);
  const compare = getCompareAtNumber(product);
  if (sale == null || compare == null || compare <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((1 - sale / compare) * 100)));
}
