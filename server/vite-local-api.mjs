import { runVerifyPayment } from './verify-payment-core.mjs';
import { runTrackShipmentRequest } from './track-shipment-core.mjs';

function readReqBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, headers, body) {
  res.statusCode = statusCode;
  const h = headers || {};
  for (const [k, v] of Object.entries(h)) {
    if (v != null) res.setHeader(k, v);
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/**
 * @param {Record<string, string | undefined>} env
 */
export function viteLocalApiPlugin(env) {
  return {
    name: 'local-vercel-style-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/verify-payment') && !url.startsWith('/api/track-shipment')) {
          return next();
        }

        const origin = req.headers.origin;

        try {
          if (url.startsWith('/api/track-shipment')) {
            const out = await runTrackShipmentRequest({
              method: req.method || 'GET',
              url,
              origin,
              env,
            });
            return sendJson(res, out.statusCode, out.headers, out.body);
          }

          let body = {};
          if (req.method === 'POST') {
            const raw = await readReqBody(req);
            if (raw?.trim()) {
              try {
                body = JSON.parse(raw);
              } catch {
                return sendJson(res, 400, { 'Content-Type': 'application/json' }, {
                  status: 'fail',
                  message: '요청 본문이 유효한 JSON이 아닙니다.',
                });
              }
            }
          }

          const out = await runVerifyPayment({
            method: req.method || 'GET',
            origin,
            authHeader: typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined,
            body,
            env,
          });
          return sendJson(res, out.statusCode, out.headers, out.body);
        } catch (e) {
          console.error('[vite-local-api]', e);
          return sendJson(res, 500, { 'Content-Type': 'application/json' }, {
            status: 'fail',
            message: '서버 오류',
          });
        }
      });
    },
  };
}
