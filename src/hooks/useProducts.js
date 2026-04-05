// 제품 데이터를 가져오는 커스텀 훅 (캐싱: staleTime 60초)
import { useState, useEffect, useCallback } from 'react';
import { supabase, publicTable } from '../lib/supabase';

const STALE_TIME_MS = 60 * 1000; // 60초
let productsCache = { data: null, formatted: null, timestamp: 0 };

const getFormattedProducts = (data) =>
  (data || []).map((product) => {
    const cap = product.compare_at_price;
    const compareNum =
      cap != null && cap !== ''
        ? Number(cap)
        : null;
    const compareOk =
      compareNum != null && !Number.isNaN(compareNum) && compareNum > 0 ? compareNum : null;
    return {
      ...product,
      price:
        typeof product.price === 'number'
          ? `₩${product.price.toLocaleString()}`
          : product.price,
      compare_at_price: compareOk,
    };
  });

export const useProducts = () => {
  const [products, setProducts] = useState(() => productsCache.formatted ?? []);
  const [loading, setLoading] = useState(!productsCache.formatted);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (bypassCache = false) => {
    const now = Date.now();
    if (!bypassCache && productsCache.formatted && now - productsCache.timestamp < STALE_TIME_MS) {
      setProducts(productsCache.formatted);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      const { data, error: err } = await publicTable('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      const formatted = getFormattedProducts(data);
      productsCache = { data, formatted, timestamp: now };
      setProducts(formatted);
      setError(null);
    } catch (e) {
      if (import.meta.env.DEV) console.error('제품 데이터 로딩 에러:', e);
      setError('상품 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts(true)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchProducts]);

  return { products, loading, error, refetch: () => fetchProducts(true) };
};

// 성별/카테고리별 제품 필터링 훅
// category가 men/women이면 gender 기준 필터, 그 외는 category(상품 종류) 기준 필터
export const useProductsByCategory = (category) => {
  const { products, loading, error, refetch } = useProducts();
  
  const normCat = (x) => {
    const n = String(x || '')
      .toLowerCase()
      .replace(/-/g, '_');
    return n === 'household_items' ? 'household' : n;
  };

  const filteredProducts = category
    ? products.filter((p) => {
        const c = normCat(category);
        if (c === 'men' || c === 'women') return (p.gender || '').toLowerCase() === c;
        return normCat(p.category) === c;
      })
    : products;

  return { products: filteredProducts, loading, error, refetch };
};
