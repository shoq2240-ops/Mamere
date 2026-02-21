// 제품 데이터를 가져오는 커스텀 훅 (캐싱: staleTime 60초)
import { useState, useEffect, useCallback } from 'react';
import { supabase, publicTable } from '../lib/supabase';

const STALE_TIME_MS = 60 * 1000; // 60초
let productsCache = { data: null, formatted: null, timestamp: 0 };

const getFormattedProducts = (data) =>
  (data || []).map((product) => ({
    ...product,
    price:
      typeof product.price === 'number'
        ? `₩${product.price.toLocaleString()}`
        : product.price,
  }));

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
      setError(e.message);
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
  
  const filteredProducts = category 
    ? products.filter(p => {
        const c = (category || '').toLowerCase();
        if (c === 'men' || c === 'women') return (p.gender || '').toLowerCase() === c;
        return (p.category || '').toLowerCase() === c;
      })
    : products;

  return { products: filteredProducts, loading, error, refetch };
};
