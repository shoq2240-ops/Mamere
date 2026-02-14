import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 연결 설정 검증
const isConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
if (!isConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.'
  );
}

// public 스키마 명시적 지정 (Could not find the table 방지)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
});

/**
 * public 스키마의 테이블에 접근 (명시적 스키마 지정)
 * @param {string} tableName - 테이블명 (예: 'profiles', 'orders')
 */
export const publicTable = (tableName) => supabase.schema('public').from(tableName);

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