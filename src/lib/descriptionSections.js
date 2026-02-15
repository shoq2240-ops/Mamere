const DELIMITER = '|||';

/**
 * description 컬럼 값을 3개 섹션으로 분리
 * @param {string} str - DB의 description
 * @returns {{ freeShipping: string, details: string, sizeFit: string }}
 */
export const parseDescription = (str) => {
  if (!str || typeof str !== 'string') {
    return { freeShipping: '', details: '', sizeFit: '' };
  }
  if (!str.includes(DELIMITER)) {
    return { freeShipping: '', details: str.trim(), sizeFit: '' };
  }
  const parts = str.split(DELIMITER);
  return {
    freeShipping: (parts[0] || '').trim(),
    details: (parts[1] || '').trim(),
    sizeFit: (parts[2] || '').trim(),
  };
};

/**
 * 3개 섹션을 description 컬럼용 문자열로 합침
 * @param {string} freeShipping
 * @param {string} details
 * @param {string} sizeFit
 * @returns {string|null}
 */
export const serializeDescription = (freeShipping, details, sizeFit) => {
  const arr = [
    (freeShipping || '').trim(),
    (details || '').trim(),
    (sizeFit || '').trim(),
  ];
  const combined = arr.join(DELIMITER);
  return combined || null;
};
