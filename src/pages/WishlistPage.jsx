import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWishlist } from '../store/WishlistContext';
import { useCart } from '../store/CartContext';
import { publicTable } from '../lib/supabase';

const formatPrice = (price) => {
  if (typeof price === 'number') return `₩${price.toLocaleString()}`;
  if (typeof price === 'string' && price.replace(/\D/g, '').length > 0) {
    return `₩${parseInt(price.replace(/\D/g, ''), 10).toLocaleString()}`;
  }
  return price;
};

const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await publicTable('products')
          .select('*')
          .in('id', wishlist);
        if (error) throw error;
        const list = data ?? [];
        const orderMap = new Map(wishlist.map((id, i) => [String(id), i]));
        list.sort((a, b) => (orderMap.get(String(a.id)) ?? 999) - (orderMap.get(String(b.id)) ?? 999));
        setProducts(list);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [wishlist]);

  const handleAddToCart = (product) => {
    const added = addToCart(product, 1);
    if (!added) {
      const stock = product?.stock_quantity ?? product?.stock ?? 0;
      toast.error(`최대 구매 가능 수량은 ${stock}개입니다.`);
      return;
    }
    toast.success('장바구니에 담았습니다.');
  };

  return (
    <div className="bg-white min-h-screen text-[#3E2F28] antialiased pt-24 pb-32 px-8 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[10px] tracking-[0.2em] uppercase text-[#3E2F28] font-medium mb-2">wishlist</h1>
        <h2 className="text-2xl md:text-3xl font-light uppercase tracking-tight mb-12">
          {wishlist.length} items
        </h2>

        {loading ? (
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#7A6B63]">loading...</p>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[11px] tracking-widest text-[#5C4A42] uppercase mb-6">
              {wishlist.length > 0 ? '상품을 불러오는 중입니다.' : '위시리스트가 비어 있습니다.'}
            </p>
            <Link
              to="/shop"
              className="text-[10px] tracking-[0.2em] uppercase text-[#5C4A42] hover:text-[#3E2F28] border-b border-[#A8B894]/40 pb-1 transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-1.5 gap-y-16 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden bg-[#F5F5F5]">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 transition-colors"
                  aria-label="위시리스트에서 제거"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                <div className="mt-4 flex items-start text-left">
                  <div className="w-full space-y-1">
                  <Link to={`/product/${product.id}`} className="block">
                    <h3 className="text-[11px] font-medium tracking-widest uppercase text-[#000000] group-hover:opacity-80 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[11px] tracking-widest text-[#000000]/80">
                    {formatPrice(product.price)}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-3 w-full py-3 border border-[#E5E5E5] text-[10px] font-light tracking-[0.2em] uppercase text-[#666666] hover:bg-[#F9F9F9] hover:border-[#000000] hover:text-[#000000] transition-all"
                  >
                    장바구니 담기
                  </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
