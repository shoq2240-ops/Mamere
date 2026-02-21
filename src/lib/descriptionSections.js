const DELIMITER = '|||';

/**
 * description 컬럼 값을 섹션으로 분리 (화장품: details, howToUse)
 * @param {string} str - DB의 description
 * @returns {{ details: string, howToUse: string }}
 */
export const parseDescription = (str) => {
  if (!str || typeof str !== 'string') {
    return { details: '', howToUse: '' };
  }
  if (!str.includes(DELIMITER)) {
    return { details: str.trim(), howToUse: '' };
  }
  const parts = str.split(DELIMITER);
  return {
    details: (parts[0] || '').trim(),
    howToUse: (parts[1] || '').trim(),
  };
};

/**
 * 섹션을 description 컬럼용 문자열로 합침
 * @param {string} details
 * @param {string} howToUse
 * @returns {string|null}
 */
export const serializeDescription = (details, howToUse) => {
  const arr = [(details || '').trim(), (howToUse || '').trim()];
  const combined = arr.join(DELIMITER);
  return combined || null;
};
