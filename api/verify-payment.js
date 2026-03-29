/**
 * Vercel Serverless: 포트원(아임포트) V1 결제 검증
 * (디버깅) 토큰 발급용 키는 아래 상수 하드코딩 — 운영 전 반드시 제거·환경변수로 복구
 */

const API_KEY = '0883532187424730';
const API_SECRET =
  'MCe3C1QfxWLGud02t5KeNXKqNIb9fBn9zGgl5BeqkFWOQMg6I3UqVZnhF7iwNME5OPVIrWWYv8SXZXOC';

export default async function handler(req, res) {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    let body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body || '{}');
      } catch (parseErr) {
        console.error('❌ JSON.parse 실패:', parseErr);
        return res.status(400).json({ status: 'fail', message: '요청 본문이 올바른 JSON이 아닙니다.' });
      }
    } else {
      body = req.body ?? {};
    }

    const { imp_uid } = body;

    if (!imp_uid) {
      return res.status(400).json({ status: 'fail', message: 'imp_uid가 전달되지 않았습니다.' });
    }

    // 1. 포트원 토큰 발급 (imp_key / imp_secret → 상수 API_KEY, API_SECRET)
    const tokenResponse = await fetch('https://api.iamport.kr/users/getToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imp_key: API_KEY, imp_secret: API_SECRET }),
    });

    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (tokenData.code !== 0) {
      console.error('❌ 토큰 발급 실패:', tokenData);
      return res.status(500).json({ status: 'fail', message: '토큰 발급에 실패했습니다.' });
    }
    const access_token = tokenData.response?.access_token;
    if (!access_token) {
      console.error('❌ 토큰 응답에 access_token 없음:', tokenData);
      return res.status(500).json({ status: 'fail', message: '토큰 발급에 실패했습니다.' });
    }

    // 2. 포트원 결제 내역 조회 (Bearer 필수)
    const paymentResponse = await fetch(`https://api.iamport.kr/payments/${encodeURIComponent(imp_uid)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const paymentData = await paymentResponse.json().catch(() => ({}));
    if (paymentData.code !== 0) {
      console.error('❌ 결제 조회 실패:', paymentData);
      return res.status(500).json({ status: 'fail', message: paymentData.message || '결제 조회에 실패했습니다.' });
    }

    // 3. 금액 및 상태 검증
    const { amount, status } = paymentData.response ?? {};
    if (Number(amount) === 1000 && String(status).toLowerCase() === 'paid') {
      return res.status(200).json({ status: 'success', message: '검증 성공' });
    }
    console.error(`❌ 검증 실패: 결제금액(${amount}), 상태(${status})`);
    return res.status(400).json({ status: 'fail', message: '금액 위조 또는 미결제 상태입니다.' });
  } catch (error) {
    console.error('❌ 서버 내부 에러:', error);
    return res.status(500).json({ status: 'fail', message: '서버 에러가 발생했습니다.' });
  }
}
