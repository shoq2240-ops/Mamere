/**
 * 상대 URL을 절대 URL로 변환 (OG, JSON-LD 등에서 사용).
 * 이미 http/https로 시작하면 그대로 반환.
 */
export function getAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }
  const base = import.meta.env?.VITE_SITE_URL || '';
  return base ? `${base.replace(/\/$/, '')}${trimmed.startsWith('/') ? '' : '/'}${trimmed}` : trimmed;
}
