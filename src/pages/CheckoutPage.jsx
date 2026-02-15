import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import * as PortOne from '@portone/browser-sdk/v2';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { supabase, publicTable } from '../lib/supabase';
import AddressInput, { combineAddress, splitAddress } from '../components/AddressInput';
import { isSoldOut } from '../lib/productStock';

// 포트원 결제 설정 (.env의 VITE_PORTONE_* 사용)
const PORTONE_STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID;
const PORTONE_CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

// 가격이 "₩890,000" 문자열이거나 숫자일 수 있음
const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const num = parseInt(price.replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { cart, clearCart, cartCount } = useCart();

  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAddressDetail, setShippingAddressDetail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [initialProfile, setInitialProfile] = useState(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 클라이언트 기준 표시용 합계 (UI용)
  const displayTotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

  // 비로그인 → 로그인 페이지
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  // 장바구니 비어 있으면 카트로
  useEffect(() => {
    if (!authLoading && isLoggedIn && cart.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [authLoading, isLoggedIn, cart.length, navigate]);

  // 프로필에서 배송지 정보 로드
  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      setProfileLoading(true);
      const { data } = await publicTable('profiles')
        .select('full_name, address, phone')
        .eq('id', user.id)
        .maybeSingle();

      setProfileLoading(false);
      if (data) {
        const name = data.full_name ?? '';
        const { base, detail } = splitAddress(data.address ?? '');
        const phone = data.phone ?? '';
        setShippingName(name);
        setShippingAddress(base);
        setShippingAddressDetail(detail);
        setShippingPhone(phone);
        setInitialProfile({ name, address: base, addressDetail: detail, phone });
      } else {
        setInitialProfile({ name: '', address: '', addressDetail: '', phone: '' });
      }
    };

    loadProfile();
  }, [user?.id]);

  const trim = (s) => (s ?? '').trim();
  const currentAddressFull = combineAddress(shippingAddress, shippingAddressDetail);
  const initialAddressFull = initialProfile
    ? combineAddress(initialProfile.address, initialProfile.addressDetail)
    : '';
  const hasShippingChanged =
    initialProfile &&
    (trim(shippingName) !== trim(initialProfile.name) ||
      trim(currentAddressFull) !== trim(initialAddressFull) ||
      trim(shippingPhone) !== trim(initialProfile.phone));
  const showSaveAsDefaultCheckbox = hasShippingChanged === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || cart.length === 0) return;

    const name = shippingName.trim().slice(0, 100);
    const addressFull = combineAddress(shippingAddress, shippingAddressDetail).slice(0, 500);
    const phone = shippingPhone.trim().replace(/\D/g, '').slice(0, 15);
    if (!name || !shippingAddress.trim() || !phone) {
      setError('이름, 기본 주소, 전화번호를 모두 입력해주세요.');
      return;
    }

    if (!PORTONE_STORE_ID || !PORTONE_CHANNEL_KEY) {
      setError('결제 설정이 완료되지 않았습니다. .env에 VITE_PORTONE_STORE_ID, VITE_PORTONE_CHANNEL_KEY를 확인해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    // [보안] products 테이블에서 실제 가격·재고 조회 후 총액·품절 검증 (클라이언트 조작 방지)
    const cartIds = [...new Set(cart.map((i) => i.id))];
    const { data: serverProducts, error: productsError } = await publicTable('products')
      .select('id, price, name, stock_quantity, is_manual_soldout')
      .in('id', cartIds);

    if (productsError) {
      setSubmitting(false);
      setError('상품 정보를 불러올 수 없습니다. ' + productsError.message);
      return;
    }

    const parseServerPrice = (v) => {
      if (typeof v === 'number' && !Number.isNaN(v)) return Math.max(0, Math.floor(v));
      if (typeof v === 'string') {
        const n = parseInt(v.replace(/[^\d]/g, ''), 10);
        return Number.isNaN(n) ? 0 : Math.max(0, n);
      }
      return 0;
    };

    const priceMap = Object.fromEntries(
      (serverProducts ?? []).map((p) => [p.id, parseServerPrice(p.price)])
    );
    const productMap = Object.fromEntries((serverProducts ?? []).map((p) => [p.id, p]));
    const missingIds = cartIds.filter((id) => priceMap[id] == null);
    if (missingIds.length > 0) {
      setSubmitting(false);
      setError('장바구니에 유효하지 않은 상품이 포함되어 있습니다. 장바구니를 비우고 다시 시도해주세요.');
      return;
    }

    // 품절 상품 검사: 결제 전 재고/수동 품절 상태 확인
    const soldOutProduct = cart.find((item) => {
      const p = productMap[item.id];
      return p && isSoldOut(p);
    });
    if (soldOutProduct) {
      setSubmitting(false);
      setError(`'${soldOutProduct.name}' 상품이 품절되었습니다. 장바구니에서 제거 후 다시 결제해주세요.`);
      return;
    }

    // 서버 가격 기준으로 총액 계산 (수량 상한 99 적용)
    const MAX_QUANTITY = 99;
    const totalAmount = cart.reduce(
      (sum, item) => sum + (priceMap[item.id] ?? 0) * Math.max(1, Math.min(MAX_QUANTITY, Math.floor(item.quantity || 1))),
      0
    );

    if (totalAmount <= 0) {
      setSubmitting(false);
      setError('결제할 상품이 없습니다.');
      return;
    }

    if (saveAsDefault && user?.id) {
      const { error: profileError } = await publicTable('profiles').upsert(
        {
          id: user.id,
          full_name: name || null,
          address: addressFull || null,
          phone: phone || null,
        },
        { onConflict: 'id' }
      );
      if (profileError) {
        setSubmitting(false);
        setError(profileError.message);
        return;
      }
    }

    // 주문 저장 시 서버 가격 사용 (클라이언트 조작 방지, 필드 길이 제한)
    const items = cart.map((item) => ({
      id: item.id,
      name: String(item.name ?? '').slice(0, 200),
      price: priceMap[item.id] ?? parsePrice(item.price),
      quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.floor(item.quantity || 1))),
      image: typeof item.image === 'string' ? item.image.slice(0, 2048) : null,
    }));

    // 포트원 결제창 호출
    const paymentId = `dn-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const orderName = cart.length === 1
      ? cart[0].name
      : `${cart[0].name} 외 ${cart.length - 1}건`;

    try {
      const response = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID,
        channelKey: PORTONE_CHANNEL_KEY,
        paymentId,
        orderName,
        totalAmount,
        currency: 'CURRENCY_KRW',
        payMethod: 'EASY_PAY', // 카카오페이 간편결제
        customer: {
          fullName: name,
          phoneNumber: phone,
        },
      });

      // 결제 실패
      if (response?.code) {
        setSubmitting(false);
        setError(response.message || '결제에 실패했습니다.');
        return;
      }

      // 결제 성공 → profiles에서 이름/주소 조회 후 주문 저장
      const { data: profile, error: profileFetchError } = await publicTable('profiles')
        .select('full_name, address, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (profileFetchError || !profile) {
        setSubmitting(false);
        setError(profileFetchError?.message || '배송 정보를 불러올 수 없습니다.');
        return;
      }

      const shippingNameFromProfile = profile.full_name ?? name;
      const shippingAddressFromProfile = profile.address ?? addressFull;
      const shippingPhoneFromProfile = profile.phone ?? phone;

      if (!shippingNameFromProfile || !shippingAddressFromProfile || !shippingPhoneFromProfile) {
        setSubmitting(false);
        setError('프로필에 이름, 주소, 전화번호를 입력해주세요.');
        return;
      }

      // 컬럼명 이중 매핑: 기존/신규 스키마 모두 호환 (불일치 에러 방지)
      const orderPayload = {
        user_id: user.id,
        items,
        status: '결제완료',
        customer_name: shippingNameFromProfile,
        shipping_name: shippingNameFromProfile,
        phone: shippingPhoneFromProfile,
        shipping_phone: shippingPhoneFromProfile,
        total_price: totalAmount,
        total_amount: totalAmount,
        address: shippingAddressFromProfile,
        shipping_address: shippingAddressFromProfile,
      };
      const { error: orderError } = await publicTable('orders').insert(orderPayload);

      setSubmitting(false);
      if (orderError) {
        setError(orderError.message);
        return;
      }

      // [자동화] 결제 완료 후 재고 차감
      // stock_quantity에서 구매 수량을 빼고, 0이 되면 상품 상세 페이지에서 자동으로 SOLD OUT 표시됨
      for (const item of items) {
        const qty = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(item.quantity || 1)));
        const { data: prod } = await publicTable('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();
        const current = prod?.stock_quantity ?? 0;
        const newStock = Math.max(0, current - qty);
        await publicTable('products').update({ stock_quantity: newStock }).eq('id', item.id);
      }

      clearCart();
      navigate('/cart?order=success', { replace: true });
    } catch (err) {
      setSubmitting(false);
      setError(err?.message || '결제 처리 중 오류가 발생했습니다.');
    }
  };

  if (authLoading || !isLoggedIn || cart.length === 0) return null;

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-black text-white antialiased">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          Checkout
        </h1>
        <p className="text-[10px] text-white/40 tracking-widest uppercase mb-10">
          배송지 정보를 확인하고 결제를 완료하세요
        </p>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* 배송지 정보 */}
          <section className="border border-white/10 p-6 space-y-4">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-purple-500 mb-4">
              배송지 정보
            </h2>
            {profileLoading ? (
              <div className="py-4 text-white/40 text-[11px]">불러오는 중...</div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">이름</label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value.slice(0, 100))}
                    placeholder="수령인 이름"
                    className="w-full bg-neutral-900/50 border border-white/5 px-4 py-3 text-[11px] text-white outline-none focus:border-purple-500/50 placeholder:text-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">주소</label>
                  <AddressInput
                    addressValue={shippingAddress}
                    onAddressChange={setShippingAddress}
                    detailValue={shippingAddressDetail}
                    onDetailChange={setShippingAddressDetail}
                    addressPlaceholder="기본 주소 (주소 찾기)"
                    detailPlaceholder="상세 주소 (동, 호수 등)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    placeholder="연락처"
                    className="w-full bg-neutral-900/50 border border-white/5 px-4 py-3 text-[11px] text-white outline-none focus:border-purple-500/50 placeholder:text-neutral-600"
                  />
                </div>
                {showSaveAsDefaultCheckbox && (
                  <label className="flex items-center gap-3 pt-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <span className="text-[11px] text-white/70 group-hover:text-white/90 transition-colors">
                      이 주소를 기본 배송지로 저장하시겠습니까?
                    </span>
                  </label>
                )}
              </>
            )}
          </section>

          {/* 주문 요약 */}
          <section className="border border-white/10 p-6">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-purple-500 mb-4">
              주문 요약
            </h2>
            <ul className="space-y-3 mb-6">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between text-[11px]">
                  <span className="text-white/80 truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                  <span className="text-purple-500">₩{(parsePrice(item.price) * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/70">총 결제 금액</span>
              <span className="text-xl font-black italic text-purple-500">₩{displayTotal.toLocaleString()}</span>
            </div>
          </section>

          {error && (
            <p className="text-red-500 text-[11px] text-center">{error}</p>
          )}

          <div className="flex gap-4">
            <Link
              to="/cart"
              className="flex-1 border border-white/20 py-4 text-center text-[11px] font-bold tracking-widest uppercase text-white/70 hover:bg-white/5 transition-colors"
            >
              장바구니로
            </Link>
            <button
              type="submit"
              disabled={submitting || profileLoading}
              className="flex-1 bg-white text-black py-4 text-[11px] font-black tracking-widest uppercase hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50"
            >
              {submitting ? '처리 중...' : '결제하기'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CheckoutPage;
