/**
 * 배송 추적 서버 프록시 (브라우저에 스마트택배 API 키를 노출하지 않음)
 * GET ?t_code=&t_invoice=
 * Secrets: SWEETTRACKER_API_KEY (또는 SWEET_TRACKER_API_KEY 하위 호환)
 */
import { runTrackShipmentRequest } from '../server/track-shipment-core.mjs';

export default async function handler(req, res) {
  const qPart = typeof req.url === 'string' && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const out = await runTrackShipmentRequest({
    method: req.method || 'GET',
    url: `/api/track-shipment${qPart}`,
    origin: req.headers.origin,
    env: process.env,
  });

  for (const [k, v] of Object.entries(out.headers ?? {})) {
    if (v != null) res.setHeader(k, v);
  }
  return res.status(out.statusCode).json(out.body);
}
