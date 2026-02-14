import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import * as PortOne from '@portone/browser-sdk/v2';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { supabase } from '../lib/supabase';

// 포트원 테스트 결제 설정 (가맹점: TC0ONETIME, PG: 카카오페이 테스트)
const PORTONE_STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID || 'TC0ONETIME';
const PORTONE_CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY || 'kakaopay.TC0ONETIME';

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
  const [shippingPhone, setShippingPhone] = useState('');
  const [initialProfile, setInitialProfile] = useState(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

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
      const { data } = await supabase
        .from('profiles')
        .select('name, address, phone')
        .eq('id', user.id)
        .maybeSingle();

      setProfileLoading(false);
      if (data) {
        const name = data.name ?? '';
        const address = data.address ?? '';
        const phone = data.phone ?? '';
        setShippingName(name);
        setShippingAddress(address);
        setShippingPhone(phone);
        setInitialProfile({ name, address, phone });
      } else {
        setInitialProfile({ name: '', address: '', phone: '' });
      }
    };

    loadProfile();
  }, [user?.id]);

  const trim = (s) => (s ?? '').trim();
  const hasShippingChanged =
    initialProfile &&
    (trim(shippingName) !== trim(initialProfile.name) ||
      trim(shippingAddress) !== trim(initialProfile.address) ||
      trim(shippingPhone) !== trim(initialProfile.phone));
  const showSaveAsDefaultCheckbox = hasShippingChanged === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || cart.length === 0) return;

    const name = shippingName.trim();
    const address = shippingAddress.trim();
    const phone = shippingPhone.trim();
    if (!name || !address || !phone) {
      setError('이름, 주소, 전화번호를 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    if (saveAsDefault && user?.id) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          name: name || null,
          address: address || null,
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

    const items = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: parsePrice(item.price),
      quantity: item.quantity,
      image: item.image,
    }));

    // 포트원 결제 요청 (테스트: 카카오페이)
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
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('name, address, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (profileFetchError || !profile) {
        setSubmitting(false);
        setError(profileFetchError?.message || '배송 정보를 불러올 수 없습니다.');
        return;
      }

      const shippingNameFromProfile = profile.name ?? name;
      const shippingAddressFromProfile = profile.address ?? address;
      const shippingPhoneFromProfile = profile.phone ?? phone;

      if (!shippingNameFromProfile || !shippingAddressFromProfile || !shippingPhoneFromProfile) {
        setSubmitting(false);
        setError('프로필에 이름, 주소, 전화번호를 입력해주세요.');
        return;
      }

      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        shipping_name: shippingNameFromProfile,
        shipping_address: shippingAddressFromProfile,
        shipping_phone: shippingPhoneFromProfile,
        total_amount: totalAmount,
        items,
        status: '결제완료',
      });

      setSubmitting(false);
      if (orderError) {
        setError(orderError.message);
        return;
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
        <p className="text-[10px] text-white/40 tracking-widest uppercase mb-4">
          배송지 정보를 확인하고 결제를 완료하세요
        </p>
        <p className="text-[10px] text-amber-500/80 tracking-wide mb-10">
          ※ 테스트 결제 환경 (실제 결제 발생 안 함)
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
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="수령인 이름"
                    className="w-full bg-neutral-900/50 border border-white/5 px-4 py-3 text-[11px] text-white outline-none focus:border-purple-500/50 placeholder:text-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">주소</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="배송 주소"
                    className="w-full bg-neutral-900/50 border border-white/5 px-4 py-3 text-[11px] text-white outline-none focus:border-purple-500/50 placeholder:text-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
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
              <span className="text-xl font-black italic text-purple-500">₩{totalAmount.toLocaleString()}</span>
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
