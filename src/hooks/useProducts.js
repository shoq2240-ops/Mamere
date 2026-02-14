// 제품 데이터를 가져오는 커스텀 훅
import { useState, useEffect } from 'react';
import { supabase, publicTable } from '../lib/supabase';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 제품 데이터 가져오기
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await publicTable('products')
        .select('*')
        .order('created_at', { ascending: false });

      // 배포 환경에서 Supabase 응답 확인용 (브라우저 콘솔에서 확인)
      console.log('[Supabase products] data:', data);
      console.log('[Supabase products] error:', error);

      if (error) throw error;

      // 가격 포맷팅 (Supabase에서는 숫자로 저장, UI에서는 ₩890,000 형식으로 표시)
      const formattedProducts = data.map(product => ({
        ...product,
        price: typeof product.price === 'number' 
          ? `₩${product.price.toLocaleString()}`
          : product.price
      }));

      setProducts(formattedProducts);
      setError(null);
    } catch (err) {
      console.error('제품 데이터 로딩 에러:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 실시간 구독 설정
  useEffect(() => {
    // 초기 데이터 로드
    fetchProducts();

    // Supabase Realtime 구독
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 감지
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('📦 제품 데이터 변경 감지:', payload);
          // 데이터 변경 시 새로고침
          fetchProducts();
        }
      )
      .subscribe();

    // 클린업: 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};

// 카테고리별 제품 필터링 훅
export const useProductsByCategory = (category) => {
  const { products, loading, error, refetch } = useProducts();
  
  const filteredProducts = category 
    ? products.filter(p => p.category === category)
    : products;

  return { products: filteredProducts, loading, error, refetch };
};
