/**
 * 포트원 V2 결제 검증 (Vercel Serverless)
 * POST JSON: { paymentId, expectedAmount? } — 금액은 PortOne 응답 amount.total 과 expectedAmount 일치 시 통과 (미전달 시 1000과 비교, 하위 호환)
 */

export default async function handler(req, res) {
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
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    const { paymentId, expectedAmount } = body;

    if (!paymentId) {
      return res.status(400).json({ status: 'fail', message: 'paymentId가 없습니다.' });
    }

    const secret = process.env.PORTONE_API_SECRET;
    if (!secret) {
      console.error('[verify-payment] PORTONE_API_SECRET 미설정');
      return res.status(500).json({ status: 'fail', message: '서버 설정 오류' });
    }

    const resPay = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `PortOne ${secret}`,
        },
      }
    );

    const data = await resPay.json().catch(() => null);
    if (!resPay.ok || !data) {
      console.error('[verify-payment] 조회 실패', resPay.status, data);
      return res.status(500).json({
        status: 'fail',
        message: data?.message || '결제 조회에 실패했습니다.',
      });
    }

    const portTotal = Number(data.amount?.total);
    const expected =
      expectedAmount != null && expectedAmount !== ''
        ? Number(expectedAmount)
        : 1000;
    const paid =
      data.status === 'PAID' &&
      Number.isFinite(expected) &&
      portTotal === expected;
    if (paid) {
      return res.status(200).json({ status: 'success', message: 'V2 검증 성공' });
    }

    console.error('[verify-payment] 검증 불일치', {
      paymentId,
      status: data.status,
      total: data.amount?.total,
    });
    return res.status(400).json({
      status: 'fail',
      message: '금액 또는 결제 상태가 올바르지 않습니다.',
    });
  } catch (err) {
    console.error('[verify-payment]', err);
    return res.status(500).json({ status: 'fail', message: '서버 오류' });
  }
}
