#!/usr/bin/env node
/**
 * Supabase 연결 테스트
 * .env의 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY로 연결 후
 * auth 세션 확인 및 public 테이블 존재 여부를 검사합니다.
 * 사용: node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('.env 파일을 찾을 수 없습니다.');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*VITE_SUPABASE_(URL|ANON_KEY)\s*=\s*(.+)\s*$/);
    if (m) env[m[1] === 'URL' ? 'VITE_SUPABASE_URL' : 'VITE_SUPABASE_ANON_KEY'] = m[2].trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 .env에 없습니다.');
    process.exit(1);
  }

  if (!url.startsWith('http')) {
    console.error('VITE_SUPABASE_URL이 올바른 URL이 아닙니다.');
    process.exit(1);
  }

  console.log('Supabase URL:', url.replace(/\/$/, ''));
  console.log('연결 테스트 중...\n');

  const supabase = createClient(url, key, { db: { schema: 'public' } });

  // 1) Auth 연결 확인
  const { data: session, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('❌ Auth 연결 실패:', authError.message);
    if (authError.message.includes('Invalid API key') || authError.message.includes('JWT')) {
      console.error('\n💡 Supabase Dashboard > Settings > API에서 anon public 키(eyJ로 시작하는 JWT)를 확인하세요.');
    }
    process.exit(1);
  }
  console.log('✅ Auth 연결 성공 (세션:', session?.session ? '있음' : '없음', ')');

  // 2) public 스키마 테이블 접근 테스트 (products)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (productsError) {
    if (productsError.code === '42P01' || productsError.message.includes('does not exist')) {
      console.log('⚠️  products 테이블이 없습니다. 아래 통합 SQL을 Supabase SQL Editor에서 실행하세요.');
    } else {
      console.error('❌ products 조회 실패:', productsError.message);
    }
    process.exit(1);
  }
  console.log('✅ products 테이블 접근 성공 (행 수 확인 가능)');

  // 3) profiles 존재 여부 (선택)
  const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);
  if (profilesError && (profilesError.code === '42P01' || profilesError.message.includes('does not exist'))) {
    console.log('⚠️  profiles 테이블이 없습니다. 통합 SQL 실행을 권장합니다.');
  } else if (!profilesError) {
    console.log('✅ profiles 테이블 접근 성공');
  }

  console.log('\n✅ 새 DB와 연결이 정상입니다.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
