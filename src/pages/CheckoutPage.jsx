import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { supabase, publicTable } from '../lib/supabase';
import AddressInput, { combineAddress, splitAddress, serializeAddress } from '../components/AddressInput';
import { isSoldOut } from '../lib/productStock';
import { getShippingFee } from '../lib/shipping';
import { formatPhoneDisplay } from '../lib/formatPhone';

// 포트원 V2 결제 설정 (.env의 VITE_PORTONE_* 사용, 비어 있으면 테스트용 기본값)
const getPortOneStoreId = () => {
  const v = (import.meta.env.VITE_PORTONE_STORE_ID ?? '').toString().trim();
  return v || 'store-147f2609-c82d-42f4-96d8-5e29d0ea773a';
};
const getPortOneChannelKey = () => {
  const v = (import.meta.env.VITE_PORTONE_CHANNEL_KEY ?? '').toString().trim();
  return v || 'channel-key-129cc6e8-0275-415d-b9e4-11f5d4f50146';
};

// 가격이 "₩890,000" 문자열이거나 숫자일 수 있음
const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const num = parseInt(price.replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

// 주문 번호 생성 (게스트 조회용)
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DN-${date}-${rand}`;
};

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s ?? '').trim());

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();

  const isGuest = !authLoading && !isLoggedIn;

  const [guestEmail, setGuestEmail] = useState('');
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAddressDetail, setShippingAddressDetail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [initialProfile, setInitialProfile] = useState(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [profileLoading, setProfileLoading] = useState(!isGuest);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // 클라이언트 기준 표시용: 소계 + 배송비 (3만원 이상 무료)
  const displaySubtotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const displayShippingFee = getShippingFee(displaySubtotal);
  const displayTotal = displaySubtotal + displayShippingFee;

  // 장바구니 비어 있으면 카트로 (주문 완료 화면이 아닐 때만)
  useEffect(() => {
    if (!authLoading && cart.length === 0 && !orderSuccessData) {
      navigate('/cart', { replace: true });
    }
  }, [authLoading, cart.length, navigate, orderSuccessData]);

  // 로그인 시 프로필에서 배송지 정보 로드
  useEffect(() => {
    if (!user?.id) {
      if (isGuest) setProfileLoading(false);
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);
      const { data } = await publicTable('profiles')
        .select('full_name, name, address, phone')
        .eq('id', user.id)
        .maybeSingle();

      setProfileLoading(false);
      if (data) {
        const name = (data.full_name ?? data.name ?? '').trim();
        const { base, detail } = splitAddress(data.address ?? '');
        const phone = (data.phone ?? '').trim();
        setShippingName(name);
        setShippingAddress(base);
        setShippingAddressDetail(detail);
        setShippingPhone(formatPhoneDisplay(phone) || '');
        setInitialProfile({ name, address: base, addressDetail: detail, phone });
      } else {
        setInitialProfile({ name: '', address: '', addressDetail: '', phone: '' });
      }
    };

    loadProfile();
  }, [user?.id, isGuest]);

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
    if (cart.length === 0) return;
    if (!isGuest && !user?.id) return;

    const name = shippingName.trim().slice(0, 100);
    const addressFull = combineAddress(shippingAddress, shippingAddressDetail).slice(0, 500);
    const phoneDigits = shippingPhone.trim().replace(/\D/g, '');
    const phone = phoneDigits.slice(0, 11);

    if (isGuest) {
      const email = (guestEmail ?? '').trim();
      if (!isValidEmail(email)) {
        setError('주문 조회용 이메일을 올바르게 입력해주세요.');
        return;
      }
    }

    if (!name || !shippingAddress.trim() || !phone || phone.length < 9) {
      setError('이름, 주소, 전화번호를 모두 입력해주세요.');
      return;
    }

    const portOneStoreId = getPortOneStoreId();
    const portOneChannelKey = getPortOneChannelKey();
    if (!portOneStoreId || !portOneChannelKey) {
      setError('결제 기능이 일시적으로 준비 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    if (typeof window === 'undefined' || !window.PortOne) {
      setError('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      toast.error('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
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
      setError('상품 정보를 불러올 수 없습니다. 장바구니를 비운 뒤 다시 시도해 주세요.');
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

    const MAX_QUANTITY = 99;
    // 결제 전 재고 부족 검사: 주문 수량이 현재 재고를 초과하면 결제 중단
    const insufficientStockProduct = cart.find((item) => {
      const p = productMap[item.id];
      if (!p) return false;
      const need = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(item.quantity || 1)));
      const have = Number(p.stock_quantity) ?? 0;
      return have < need;
    });
    if (insufficientStockProduct) {
      setSubmitting(false);
      setError(`'${insufficientStockProduct.name}' 상품의 재고가 부족합니다. 수량을 줄이거나 장바구니에서 제거 후 다시 시도해주세요.`);
      return;
    }

    // 서버 가격 기준 소계 + 배송비 (3만원 이상 무료)
    const subtotal = cart.reduce(
      (sum, item) => sum + (priceMap[item.id] ?? 0) * Math.max(1, Math.min(MAX_QUANTITY, Math.floor(item.quantity || 1))),
      0
    );
    const shippingFee = getShippingFee(subtotal);
    const totalAmount = subtotal + shippingFee;

    if (subtotal <= 0) {
      setSubmitting(false);
      setError('결제할 상품이 없습니다.');
      return;
    }

    if (saveAsDefault && user?.id) {
      const { error: profileError } = await publicTable('profiles').upsert(
        {
          id: user.id,
          full_name: name || null,
          address: serializeAddress(shippingAddress, shippingAddressDetail) || null,
          phone: shippingPhone.replace(/\D/g, '').trim() || null,
        },
        { onConflict: 'id' }
      );
      if (profileError) {
        toast.error('기본 배송지로 저장하지 못했습니다. 결제는 계속 진행됩니다.');
      }
    }

    // 주문 저장 시 서버 가격 사용 (클라이언트 조작 방지, 필드 길이 제한)
    // Supabase products.id(BIGINT)와 매칭되도록 id를 명시. API에서 id 또는 product_id 로 수용.
    const items = cart.map((item) => {
      const productId = item.id != null ? item.id : item.product_id;
      return {
        id: productId,
        product_id: productId,
        name: String(item.name ?? '').slice(0, 200),
        price: priceMap[item.id] ?? parsePrice(item.price),
        quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.floor(item.quantity || 1))),
        image: typeof item.image === 'string' ? item.image.slice(0, 2048) : null,
      };
    });

    // 포트원 V2 결제창 호출 (requestPayment) — paymentId 40자 이하(이니시스 등 제한)
    const paymentId = `payment-${Date.now()}`;
    const orderName = cart.length === 1
      ? cart[0].name
      : `${cart[0].name} 외 ${cart.length - 1}건`;

    const customerEmail = isGuest ? (guestEmail ?? '').trim() : (user?.email ?? 'test@test.com');
    const customer = {
      fullName: name || '테스트',
      email: customerEmail || 'test@test.com',
      phoneNumber: phone || '010-1234-5678',
    };

    try {
      const response = await window.PortOne.requestPayment({
        storeId: portOneStoreId,
        channelKey: portOneChannelKey,
        paymentId,
        orderName,
        totalAmount: Number(totalAmount),
        currency: 'KRW',
        payMethod: 'CARD',
        customer,
      });

      // 결제 실패 또는 취소: response.code 가 있으면 에러
      if (response?.code != null) {
        setSubmitting(false);
        const message = response?.message || '결제가 완료되지 않았습니다. 다시 시도해 주세요.';
        setError(message);
        toast.error(message);
        return;
      }

      // 결제 성공: 서버 검증 API 호출 후, 검증 성공 시에만 완료 처리 (금액 조작 방지)
      if (typeof console !== 'undefined' && console.log) {
        console.log('PortOne payment success:', response);
      }

      const orderPayloadForVerify = {
        items,
        customer_name: name,
        shipping_name: name,
        phone,
        shipping_phone: phone,
        address: addressFull,
        shipping_address: addressFull,
      };

      let verifyRes;
      let verifyJson = {};
      try {
        verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            expectedAmount: totalAmount,
            cartItems: items,
            orderPayload: orderPayloadForVerify,
            isGuest,
            guestEmail: isGuest ? (guestEmail ?? '').trim() : null,
            userId: user?.id ?? null,
          }),
        });
        verifyJson = await verifyRes.json().catch(() => ({}));
      } catch {
        setSubmitting(false);
        const msg = '결제 검증 요청 중 오류가 발생했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.';
        setError(msg);
        toast.error(msg);
        return;
      }

        if (!verifyRes.ok || !verifyJson?.success) {
          setSubmitting(false);
          const msg = verifyJson?.error || '결제 검증에 실패했습니다. 다시 시도해 주세요.';
          setError(msg);
          toast.error(msg);
          return;
        }

      toast.success('결제가 완료되었습니다!');
      clearCart();
      setOrderSuccessData({
        orderNumber: verifyJson.orderNumber || generateOrderNumber(),
        guestEmail: isGuest ? (guestEmail ?? '').trim() : undefined,
        isGuest: !!isGuest,
      });
    } catch {
      setSubmitting(false);
      setError('결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  if (authLoading) return null;

  // 주문 완료 화면: 주문 번호 + 안내 (게스트/회원 공통) — 장바구니 비어 있어도 표시
  if (orderSuccessData) {
    const isGuestSuccess = orderSuccessData.isGuest === true;
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen bg-[#FFFFFF] text-[#000000] antialiased">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-semibold tracking-tight uppercase mb-2">
            주문 완료
          </h1>
          <p className="text-[10px] text-[#999999] tracking-widest uppercase mb-10">
            결제가 정상적으로 완료되었습니다
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[#F0F0F0] p-8 mb-8"
          >
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#666666] mb-2">
              주문 번호
            </p>
            <p className="text-3xl font-semibold tracking-tight text-[#000000] mb-6 break-all">
              {orderSuccessData.orderNumber}
            </p>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              {isGuestSuccess ? (
                <>
                  이메일과 주문번호로 추후 조회가 가능합니다.
                  <br />
                  주문 확인 메일이 {orderSuccessData.guestEmail} 로 발송됩니다.
                </>
              ) : (
                <>
                  주문 내역은 마이페이지에서 확인하실 수 있습니다.
                </>
              )}
            </p>
          </motion.div>
          <div className="flex gap-4 justify-center flex-wrap">
            {isGuestSuccess ? (
              <Link
                to="/order-lookup"
                className="bg-[#000000] text-[#FFFFFF] px-6 py-3 text-[11px] font-medium tracking-widest uppercase hover:opacity-90 transition-colors"
              >
                주문 조회
              </Link>
            ) : (
              <Link
                to="/orders"
                className="bg-[#000000] text-[#FFFFFF] px-6 py-3 text-[11px] font-medium tracking-widest uppercase hover:opacity-90 transition-colors"
              >
                주문 내역
              </Link>
            )}
            <Link
              to="/"
              className="border border-[#000000] px-6 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-[#000000] hover:text-[#FFFFFF] transition-colors"
            >
              홈으로
            </Link>
            <Link
              to="/shop"
              className="border border-[#000000] px-6 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-[#000000] hover:text-[#FFFFFF] transition-colors"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) return null;

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#FFFFFF] text-[#000000] antialiased">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight uppercase mb-2">
          Checkout
        </h1>
        <p className="text-[10px] text-[#999999] tracking-widest uppercase mb-10">
          {isGuest
            ? '게스트로 결제합니다. 이메일과 배송지를 입력해주세요.'
            : '배송지 정보를 확인하고 결제를 완료하세요'}
        </p>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {isGuest && (
            <section className="border border-[#F0F0F0] p-6 space-y-4">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#000000] mb-4">
                주문 조회용 이메일
              </h2>
              <p className="text-[10px] text-[#666666] mb-3">
                주문 완료 후 이메일과 주문번호로 조회할 수 있습니다.
              </p>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value.slice(0, 254))}
                placeholder="example@email.com"
                maxLength={254}
                className="w-full bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999]"
                autoComplete="email"
              />
              <p className="text-[10px] text-[#999999]">
                로그인하시면 주문 내역을 마이페이지에서 바로 확인할 수 있습니다.{' '}
                <Link to="/login" className="underline hover:text-[#000000]">로그인</Link>
              </p>
            </section>
          )}

          {/* 배송지 정보 */}
          <section className="border border-[#F0F0F0] p-6 space-y-4">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#000000] mb-4">
              배송지 정보
            </h2>
            {profileLoading ? (
              <div className="py-4 text-[#999999] text-[11px]">불러오는 중...</div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-[#666666] mb-2">이름</label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value.slice(0, 100))}
                    placeholder="수령인 이름"
                    maxLength={100}
                    className="w-full bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-[#666666] mb-2">주소</label>
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
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-[#666666] mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(formatPhoneDisplay(e.target.value.slice(0, 20)))}
                    placeholder="010-0000-0000"
                    maxLength={20}
                    className="w-full bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999]"
                  />
                </div>
                {showSaveAsDefaultCheckbox && (
                  <label className="flex items-center gap-3 pt-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="w-4 h-4 rounded border-[#CCCCCC] bg-white text-[#000000] focus:ring-[#000000] focus:ring-offset-0"
                    />
                    <span className="text-[11px] text-[#666666] group-hover:text-[#000000] transition-colors">
                      이 주소를 기본 배송지로 저장하시겠습니까?
                    </span>
                  </label>
                )}
              </>
            )}
          </section>

          {/* 주문 요약 */}
          <section className="border border-[#F0F0F0] p-6">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#000000] mb-4">
              주문 요약
            </h2>
            <ul className="space-y-3 mb-6">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between text-[11px]">
                  <span className="text-[#333333] truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                  <span className="text-[#000000]">₩{(parsePrice(item.price) * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-[#F0F0F0] pt-4">
              <div className="flex justify-between text-[11px] text-[#666666]">
                <span className="tracking-widest uppercase">소계</span>
                <span>₩{displaySubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#666666]">
                <span className="tracking-widest uppercase">배송비</span>
                <span>{displayShippingFee === 0 ? '무료배송' : `₩${displayShippingFee.toLocaleString()}`}</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-[#F0F0F0] pt-4 mt-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#666666]">총 결제 금액</span>
              <span className="text-xl font-semibold text-[#000000]">₩{displayTotal.toLocaleString()}</span>
            </div>
          </section>

          {error && (
            <p className="text-red-500 text-[11px] text-center">{error}</p>
          )}

          <div className="flex gap-4">
            <Link
              to="/cart"
              className="flex-1 border border-white/20 py-4 text-center text-[11px] font-bold tracking-widest uppercase text-[#666666] hover:bg-[#F9F9F9] transition-colors"
            >
              장바구니로
            </Link>
            <button
              type="submit"
              disabled={submitting || (!isGuest && profileLoading)}
              className="flex-1 bg-[#000000] text-[#FFFFFF] py-4 text-[11px] font-medium tracking-widest uppercase hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
