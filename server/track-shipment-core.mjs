/**
 * 스마트택배 조회 서버측 처리 (SWEETTRACKER_API_KEY는 서버에만 존재)
 */
import { corsHeaders, resolveAllowedOrigin } from './verify-payment-core.mjs';

const API_BASE = 'https://info.sweettracker.co.kr';

function normalizeSweetTrackerPayload(data, resOk) {
  if (!resOk) {
    return { ok: false, message: '배송 정보 등록 중', pending: true };
  }

  const complete = data?.complete === true || data?.status === true;
  const msg = data?.msg ?? data?.message ?? '';
  const item = data?.item ?? data?.lastDetail ?? data;

  if (
    !complete &&
    (String(msg).toLowerCase().includes('없') ||
      String(msg).toLowerCase().includes('등록') ||
      data?.code === '104')
  ) {
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
}

async function upstreamFetch(carrierId, invoice, apiKey) {
  const params = new URLSearchParams({
    t_key: apiKey,
    t_code: String(carrierId).trim(),
    t_invoice: String(invoice).trim(),
  });
  const url = `${API_BASE}/api/v1/trackingInfo?${params.toString()}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function corsJsonHeaders(allowOrigin) {
  return { 'Content-Type': 'application/json', ...corsHeaders(allowOrigin) };
}

/**
 * @param {{ method: string, url: string, origin?: string, env: Record<string, string | undefined> }} ctx
 */
export async function runTrackShipmentRequest(ctx) {
  const { method, url, origin, env } = ctx;
  const pathname = url.split('?')[0];
  const allowOrigin = resolveAllowedOrigin(origin, env);
  const baseHeaders = corsJsonHeaders(allowOrigin);

  if (method === 'OPTIONS') {
    return { statusCode: allowOrigin ? 200 : 403, headers: baseHeaders, body: {} };
  }

  if (method !== 'GET') {
    return { statusCode: 405, headers: baseHeaders, body: { ok: false, message: 'Method Not Allowed' } };
  }

  if (pathname !== '/api/track-shipment') {
    return { statusCode: 404, headers: baseHeaders, body: { ok: false, message: 'Not found' } };
  }

  if (!allowOrigin && env.NODE_ENV === 'production') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: false, message: '허용되지 않은 출처입니다.' },
    };
  }

  const q = url.includes('?') ? url.slice(url.indexOf('?')) : '';
  const sp = new URLSearchParams(q);
  const t_code = sp.get('t_code') ?? '';
  const t_invoice = sp.get('t_invoice') ?? '';

  if (!t_code.trim() || !t_invoice.trim()) {
    return {
      statusCode: 400,
      headers: baseHeaders,
      body: { ok: false, message: '택배사 정보와 운송장 번호가 필요합니다.' },
    };
  }

  const apiKey =
    env.SWEETTRACKER_API_KEY ??
    env.SWEET_TRACKER_API_KEY ??
    '';

  if (!apiKey.trim()) {
    return {
      statusCode: 200,
      headers: baseHeaders,
      body: { ok: false, message: '배송 정보 등록 중', pending: true },
    };
  }

  try {
    const { res, data } = await upstreamFetch(t_code, t_invoice, apiKey.trim());
    const body = normalizeSweetTrackerPayload(data, res.ok);
    return { statusCode: 200, headers: baseHeaders, body };
  } catch (_e) {
    return {
      statusCode: 200,
      headers: baseHeaders,
      body: { ok: false, message: '배송 정보 등록 중', pending: true },
    };
  }
}
