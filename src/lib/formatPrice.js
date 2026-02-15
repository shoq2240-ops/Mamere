/**
 * 가격을 원화(₩) 형식으로 포맷
 * @param {number|string} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  if (price == null) return '';
  if (typeof price === 'number') return `₩${price.toLocaleString()}`;
  if (typeof price === 'string') {
    const num = parseInt(price.replace(/\D/g, ''), 10);
    if (!isNaN(num)) return `₩${num.toLocaleString()}`;
    return price;
  }
  return String(price);
};
