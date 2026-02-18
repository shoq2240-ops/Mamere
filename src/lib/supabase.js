import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 연결 설정 검증
const isConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.'
  );
}

// public 스키마 명시적 지정 (Could not find the table 방지)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
});

/**
 * OAuth/이메일 인증 후 리디렉션 URL
 * - window.location.origin 사용으로 로컬/배포 환경 자동 대응
 * - Supabase Dashboard > Authentication > URL Configuration > Redirect URLs에 동일 주소 등록 필요
 * @param {string} [path='/'] - 리디렉션 경로
 * @returns {string} 전체 URL (예: https://example.com/ 또는 http://localhost:5173/)
 */
export function getAuthRedirectUrl(path = '/') {
  if (typeof window === 'undefined') return '';
  return new URL(path, window.location.origin).href;
}

/**
 * public 스키마의 테이블에 접근 (명시적 스키마 지정)
 * @param {string} tableName - 테이블명 (예: 'profiles', 'orders')
 */
export const publicTable = (tableName) => supabase.schema('public').from(tableName);

/**
 * 사용자 IP 조회 (동의 로그용)
 * @returns {Promise<string|null>}
 */
export async function fetchClientIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data?.ip ?? null;
  } catch {
    return null;
  }
}

/**
 * 동의 로그 기록 (회원가입 시)
 * @param {object} params
 * @param {string} params.userId - auth.users.id
 * @param {string} [params.ipAddress] - 클라이언트 IP
 * @param {string} [params.termsAgreedAt] - 이용약관 동의 시점 (ISO)
 * @param {string} [params.privacyAgreedAt] - 개인정보 동의 시점 (ISO)
 * @param {boolean} [params.marketingAgreed] - 마케팅 수신 동의
 * @returns {Promise<{ id?: string; error?: string }>}
 */
export async function logUserConsent({
  userId,
  ipAddress = null,
  termsAgreedAt = new Date().toISOString(),
  privacyAgreedAt = new Date().toISOString(),
  marketingAgreed = false,
}) {
  const { data, error } = await supabase.rpc('log_user_consent', {
    p_user_id: userId,
    p_ip_address: ipAddress,
    p_terms_agreed_at: termsAgreedAt,
    p_privacy_agreed_at: privacyAgreedAt,
    p_marketing_agreed: marketingAgreed,
  });
  if (error) return { error: error.message };
  return { id: data };
}

/**
 * 회원 탈퇴 (Soft Delete)
 * profiles.is_withdrawn = true, withdrawn_at = NOW()
 * @returns {Promise<{ error?: string }>}
 */
export async function withdrawUser() {
  const { error } = await supabase.rpc('withdraw_user');
  if (error) return { error: error.message };
  return {};
}

/**
 * Supabase 연결 상태 확인 (profiles 테이블 없이 auth로 검증)
 * @returns {Promise<{ ok: boolean; error?: string }>}
 */
export async function checkSupabaseConnection() {
  if (!isConfigured) {
    return { ok: false, error: 'Supabase URL 또는 API 키가 설정되지 않았습니다.' };
  }
  try {
    const { error } = await supabase.auth.getSession();
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || '연결 확인 실패' };
  }
}