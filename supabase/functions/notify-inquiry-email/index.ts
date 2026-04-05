/**
 * inquiries INSERT → 운영자 메일 알림 (Resend)
 *
 * Supabase Database Webhook 이 이 함수 URL로 POST 합니다.
 * 배포: supabase functions deploy notify-inquiry-email --no-verify-jwt
 *
 * Secrets: RESEND_API_KEY, INQUIRY_NOTIFY_TO, INQUIRY_NOTIFY_FROM, INQUIRY_WEBHOOK_SECRET
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-inquiry-webhook-secret',
};

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const expectedSecret = Deno.env.get('INQUIRY_WEBHOOK_SECRET');
  const provided = req.headers.get('x-inquiry-webhook-secret') ?? '';
  if (!expectedSecret || provided !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (payload.table !== 'inquiries') {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const record = payload.record;
  if (!record || payload.type !== 'INSERT') {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const notifyTo = Deno.env.get('INQUIRY_NOTIFY_TO');
  const notifyFrom =
    Deno.env.get('INQUIRY_NOTIFY_FROM')?.trim() || 'Mamere <onboarding@resend.dev>';

  if (!resendKey || !notifyTo) {
    console.error('RESEND_API_KEY or INQUIRY_NOTIFY_TO missing');
    return new Response(JSON.stringify({ error: 'Email not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const first = String(record.first_name ?? '');
  const last = String(record.last_name ?? '');
  const email = String(record.email ?? '');
  const phone = record.phone != null ? String(record.phone) : '';
  const subjectRaw = record.subject != null ? String(record.subject) : '';
  const subjectLabel = subjectRaw || '(주제 없음)';
  const message = record.message != null ? String(record.message) : '';
  const id = record.id != null ? String(record.id) : '';

  const text = [
    '새 문의가 접수되었습니다.',
    '',
    `ID: ${id}`,
    `이름: ${last} ${first}`,
    `고객 이메일: ${email}`,
    `전화: ${phone || '-'}`,
    `주제: ${subjectLabel}`,
    '',
    '메시지:',
    message,
  ].join('\n');

  const emailBody: Record<string, unknown> = {
    from: notifyFrom,
    to: [notifyTo],
    subject: `[마메르 문의] ${subjectLabel} — ${last}${first}`,
    text,
  };
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailBody.reply_to = email;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailBody),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('Resend error:', res.status, errBody);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
