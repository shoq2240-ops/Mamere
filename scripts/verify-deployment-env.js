#!/usr/bin/env node
/**
 * 배포 환경 검증: .env 변수가 supabase.js에서 기대하는 대로 있는지 확인
 * (실제 값은 출력하지 않고, 존재·형식만 검사)
 * 사용: node scripts/verify-deployment-env.js
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');

const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_PORTONE_STORE_ID',
  'VITE_PORTONE_CHANNEL_KEY',
];

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('❌ .env 파일이 없습니다.');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
let failed = false;

for (const key of required) {
  const value = env[key];
  if (value === undefined || value === '') {
    console.error(`❌ ${key} 이(가) 비어 있거나 없습니다.`);
    failed = true;
  } else {
    console.log(`✅ ${key} 설정됨`);
  }
}

if (env.VITE_SUPABASE_URL && !env.VITE_SUPABASE_URL.startsWith('http')) {
  console.error('❌ VITE_SUPABASE_URL 은 http(s):// 로 시작해야 합니다.');
  failed = true;
}

if (failed) process.exit(1);

const recommended = [
  ['SUPABASE_SERVICE_ROLE_KEY', '결제 후 주문·재고 처리(Vercel api/verify-payment)'],
  ['SUPABASE_URL', '서버에서 Supabase 호출 시(미설정이면 VITE_SUPABASE_URL 사용 가능)'],
  ['SWEETTRACKER_API_KEY', '배송 추적 api/track-shipment (옛 VITE_SWEET_TRACKER_API_KEY 대체)'],
  ['SITE_ORIGIN', '프로덕션 CORS(예: https://your-domain.com)'],
];
for (const [k, hint] of recommended) {
  if (!env[k]?.trim()) {
    console.warn(`⚠️  권장: ${k} — ${hint}`);
  }
}

console.log('\n✅ 배포에 필요한 .env 변수가 모두 있습니다. (Vercel에도 동일 키로 설정하세요.)');
