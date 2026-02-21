/**
 * Lookbook Section 데이터
 * 이미지 URL과 캡션을 여기서 관리하세요.
 * 나중에 Supabase Storage 연동 시 이 파일에서 fetch 로직으로 교체하면 됩니다.
 */

export const LOOKBOOK_ITEMS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85',
    caption: 'SEASON CAMPAIGN 01',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616bc469?w=1200&q=85',
    caption: '2026 SS COLLECTION',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85',
    caption: 'LOOKBOOK ARCHIVE',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1558171813-1e8e0dfd1550?w=1200&q=85',
    caption: 'Dr.care',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85',
    caption: 'BLACK SILHOUETTE',
  },
];

/**
 * Supabase Storage 연동 예시 (필요 시 사용):
 * 
 * import { supabase } from '../lib/supabase';
 * 
 * export const fetchLookbookFromSupabase = async () => {
 *   const { data } = await supabase.storage
 *     .from('lookbook')
 *     .list('', { limit: 20 });
 *   return data?.map((file, i) => ({
 *     id: file.id,
 *     image: supabase.storage.from('lookbook').getPublicUrl(file.name).data.publicUrl,
 *     caption: file.metadata?.caption || `CAMPAIGN ${String(i + 1).padStart(2, '0')}`,
 *   })) ?? [];
 * };
 */
