/**
 * 택배 실시간 조회 (스마트택배 스타일)
 * - 브라우저에는 API 키를 두지 않고 /api/track-shipment(Vercel·로컬 Vite 플러그인)만 호출합니다.
 */

/**
 * 배송 조회 API 호출
 * @param {string} carrierId - 택배사 코드 (예: 04 = CJ대한통운)
 * @param {string} trackingNumber - 운송장 번호
 * @returns {Promise<{ ok: boolean, message?: string, currentLocation?: string, status?: string, updatedAt?: string, details?: Array<{ time: string, status: string, location: string }>, pending?: boolean }>}
 */
export async function fetchTrackingInfo(carrierId, trackingNumber) {
  if (!carrierId?.trim() || !trackingNumber?.trim()) {
    return { ok: false, message: '택배사 정보와 운송장 번호가 필요합니다.' };
  }

  try {
    const params = new URLSearchParams({
      t_code: String(carrierId).trim(),
      t_invoice: String(trackingNumber).trim(),
    });
    const res = await fetch(`/api/track-shipment?${params.toString()}`, { method: 'GET' });
    const json = await res.json().catch(() => ({}));
    return json;
  } catch (e) {
    if (import.meta.env?.DEV) console.warn('[trackingApi]', e);
    return { ok: false, message: '배송 정보 등록 중', pending: true };
  }
}

/** 택배사 목록 (스마트택배 코드 예시) */
export const CARRIERS = [
  { id: '04', name: 'CJ대한통운' },
  { id: '05', name: '한진택배' },
  { id: '08', name: '롯데택배' },
  { id: '01', name: '우체국택배' },
  { id: '06', name: '로젠택배' },
  { id: '23', name: '경동택배' },
  { id: '11', name: '일양로지스' },
];
