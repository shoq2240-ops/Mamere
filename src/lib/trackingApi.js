/**
 * 택배 실시간 조회 API (스마트택배 Sweet Tracker 스타일)
 * - 환경변수: VITE_SWEET_TRACKER_API_KEY (info.sweettracker.co.kr API 키)
 * - 택배사 코드(carrier_id)와 운송장 번호(tracking_number)로 조회
 */

const API_BASE = 'https://info.sweettracker.co.kr';
const API_KEY = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SWEET_TRACKER_API_KEY : '';

/**
 * 배송 조회 API 호출
 * @param {string} carrierId - 택배사 코드 (예: 04 = CJ대한통운)
 * @param {string} trackingNumber - 운송장 번호
 * @returns {Promise<{ ok: boolean, message?: string, currentLocation?: string, status?: string, updatedAt?: string, details?: Array<{ time: string, status: string, location: string }> }>}
 */
export async function fetchTrackingInfo(carrierId, trackingNumber) {
  if (!carrierId?.trim() || !trackingNumber?.trim()) {
    return { ok: false, message: '택배사 정보와 운송장 번호가 필요합니다.' };
  }

  if (!API_KEY?.trim()) {
    return { ok: false, message: '배송 정보 등록 중', pending: true };
  }

  try {
    const params = new URLSearchParams({
      t_key: API_KEY,
      t_code: String(carrierId).trim(),
      t_invoice: String(trackingNumber).trim(),
    });
    const url = `${API_BASE}/api/v1/trackingInfo?${params.toString()}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: '배송 정보 등록 중', pending: true };
    }

    // 스마트택배 응답 형식: complete, msg, item etc.
    const complete = data?.complete === true || data?.status === true;
    const msg = data?.msg ?? data?.message ?? '';
    const item = data?.item ?? data?.lastDetail ?? data;

    if (!complete && (msg?.toLowerCase().includes('없') || msg?.toLowerCase().includes('등록') || data?.code === '104')) {
      return { ok: false, message: '배송 정보 등록 중', pending: true };
    }

    const trackingDetails = Array.isArray(data?.trackingDetails)
      ? data.trackingDetails
      : Array.isArray(data?.item?.trackingDetails)
        ? data.item.trackingDetails
        : Array.isArray(data?.details)
          ? data.details
          : [];

    const last = trackingDetails[0] || item;
    const currentLocation = last?.where ?? last?.location ?? item?.from?.name ?? '';
    const status = last?.kind ?? last?.status ?? last?.state ?? item?.lastState ?? '';
    const updatedAt = last?.time ?? last?.date ?? item?.lastTime ?? '';

    const details = trackingDetails.map((d) => ({
      time: d.time ?? d.date ?? '',
      status: d.kind ?? d.status ?? d.state ?? '',
      location: d.where ?? d.location ?? '',
    }));

    return {
      ok: true,
      currentLocation: currentLocation || undefined,
      status: status || undefined,
      updatedAt: updatedAt || undefined,
      details,
    };
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
