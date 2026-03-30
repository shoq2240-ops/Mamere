import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/AuthContext';
import AddressInput, { combineAddress, serializeAddress, splitAddress } from '../components/AddressInput';
import { checkSupabaseConnection, publicTable, supabase, withdrawUser } from '../lib/supabase';

const PencilIcon = () => (
  <svg className="h-3.5 w-3.5 text-[#B0B0B0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M16.5 3.5l4 4L8 20l-5 1 1-5 12.5-12.5z" />
  </svg>
);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value ?? '').trim());

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressBase, setAddressBase] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [draftAddressBase, setDraftAddressBase] = useState('');
  const [draftAddressDetail, setDraftAddressDetail] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      setEmail(user.email || '');

      const conn = await checkSupabaseConnection();
      if (!conn.ok) {
        setLoading(false);
        setError(conn.error || '프로필을 불러오지 못했습니다.');
        return;
      }

      const { data, error: fetchError } = await publicTable('profiles')
        .select('full_name, address, phone')
        .eq('id', user.id)
        .maybeSingle();

      setLoading(false);
      if (fetchError) {
        setError('프로필을 불러오지 못했습니다.');
        return;
      }

      const loadedName = data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '고객';
      const loadedEmail = user.email || '';
      const loadedPhone = data?.phone || user.user_metadata?.phone || '';
      const { base, detail } = splitAddress(data?.address || '');

      setName(loadedName);
      setEmail(loadedEmail);
      setPhone(loadedPhone);
      setAddressBase(base);
      setAddressDetail(detail);

      setDraftName(loadedName);
      setDraftEmail(loadedEmail);
      setDraftPhone(loadedPhone);
      setDraftAddressBase(base);
      setDraftAddressDetail(detail);
    };

    loadProfile();
  }, [user]);

  const displayAddress = useMemo(() => {
    const merged = combineAddress(addressBase, addressDetail);
    return merged || '등록된 주소가 없습니다.';
  }, [addressBase, addressDetail]);

  const handleEditToggle = (section) => {
    if (section === 'name') {
      setIsEditingName((prev) => !prev);
      setDraftName(name);
      return;
    }
    if (section === 'email') {
      setIsEditingEmail((prev) => !prev);
      setDraftEmail(email);
      return;
    }
    if (section === 'phone') {
      setIsEditingPhone((prev) => !prev);
      setDraftPhone(phone);
      return;
    }
    setIsEditingAddress((prev) => !prev);
    setDraftAddressBase(addressBase);
    setDraftAddressDetail(addressDetail);
  };

  const handleEditCancel = (section) => {
    if (section === 'name') {
      setDraftName(name);
      setIsEditingName(false);
      return;
    }
    if (section === 'email') {
      setDraftEmail(email);
      setIsEditingEmail(false);
      return;
    }
    if (section === 'phone') {
      setDraftPhone(phone);
      setIsEditingPhone(false);
      return;
    }
    setDraftAddressBase(addressBase);
    setDraftAddressDetail(addressDetail);
    setIsEditingAddress(false);
  };

  const handleSave = async (section) => {
    if (!user?.id) return;
    setSaving(true);
    setError('');

    try {
      if (section === 'name') {
        const nextName = draftName.trim().slice(0, 100);

        if (!nextName) {
          throw new Error('이름을 입력해 주세요.');
        }

        const { error: profileErr } = await publicTable('profiles').upsert(
          { id: user.id, full_name: nextName },
          { onConflict: 'id' }
        );
        if (profileErr) throw profileErr;

        setName(nextName);
        setIsEditingName(false);
        toast.success('이름이 저장되었습니다.');
        return;
      }

      if (section === 'email') {
        const nextEmail = draftEmail.trim().slice(0, 254);
        if (!isValidEmail(nextEmail)) {
          throw new Error('올바른 이메일 주소를 입력해 주세요.');
        }
        if (nextEmail !== (user.email || '')) {
          const { error: authErr } = await supabase.auth.updateUser({ email: nextEmail });
          if (authErr) throw authErr;
          toast.success('이메일 변경 확인 메일을 전송했습니다.');
        } else {
          toast.success('이메일이 저장되었습니다.');
        }
        setEmail(nextEmail);
        setIsEditingEmail(false);
        return;
      }

      if (section === 'phone') {
        const nextPhone = draftPhone.trim().replace(/\D/g, '').slice(0, 11);
        const { error: phoneErr } = await publicTable('profiles').upsert(
          { id: user.id, phone: nextPhone || null },
          { onConflict: 'id' }
        );
        if (phoneErr) throw phoneErr;
        setPhone(nextPhone);
        setIsEditingPhone(false);
        toast.success('휴대폰 번호가 저장되었습니다.');
        return;
      }

      const serializedAddress = serializeAddress(draftAddressBase, draftAddressDetail);
      if (!serializedAddress.trim()) {
        throw new Error('주소를 입력해 주세요.');
      }

      const { error: addressErr } = await publicTable('profiles').upsert(
        { id: user.id, address: serializedAddress },
        { onConflict: 'id' }
      );
      if (addressErr) throw addressErr;

      setAddressBase(draftAddressBase.trim());
      setAddressDetail(draftAddressDetail.trim());
      setIsEditingAddress(false);
      toast.success('주소가 저장되었습니다.');
    } catch (saveError) {
      setError(saveError?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    setDraftAddressBase('');
    setDraftAddressDetail('');
    setIsEditingAddress(true);
  };

  const handleWithdraw = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까?')) return;
    setWithdrawing(true);
    try {
      const { error: withdrawError } = await withdrawUser();
      if (withdrawError) throw new Error(withdrawError);
      await supabase.auth.signOut();
      toast.success('회원 탈퇴가 완료되었습니다.');
      navigate('/', { replace: true });
    } catch (withdrawErr) {
      setError(withdrawErr?.message || '회원 탈퇴에 실패했습니다.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pb-20 pt-24 antialiased">
      <div className="mx-auto mt-20 w-full max-w-[600px]">
        {loading ? (
          <p className="text-[12px] font-light text-[#888888]">loading...</p>
        ) : (
          <>
            {error && <p className="mb-4 text-[11px] font-light text-red-500">{error}</p>}

            <section className="rounded-md border border-[#E5E5E5] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extralight lowercase tracking-wider text-[#AAAAAA]">name</p>
                <button type="button" onClick={() => handleEditToggle('name')} aria-label="이름 수정">
                  <PencilIcon />
                </button>
              </div>
              {isEditingName ? (
                <div className="mt-2 space-y-3">
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value.slice(0, 100))}
                    className="w-full bg-transparent border-b border-[#E5E5E5] py-3 px-2 text-[13px] font-light text-[#1A1A1A] outline-none focus:border-black transition-colors"
                    placeholder="이름"
                  />
                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => handleEditCancel('name')}
                      className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer"
                    >
                      cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('name')}
                      disabled={saving}
                      className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer disabled:opacity-50"
                    >
                      save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[13px] font-light text-[#1A1A1A]">{name}</p>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extralight lowercase tracking-wider text-[#AAAAAA]">email</p>
                  <button type="button" onClick={() => handleEditToggle('email')} aria-label="이메일 수정">
                    <PencilIcon />
                  </button>
                </div>
                {isEditingEmail ? (
                  <div className="mt-2 space-y-3">
                    <input
                      type="email"
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value.slice(0, 254))}
                      className="w-full bg-transparent border-b border-[#E5E5E5] py-3 px-2 text-[13px] font-light text-[#1A1A1A] outline-none focus:border-black transition-colors"
                      placeholder="이메일"
                    />
                    <div className="mt-4 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => handleEditCancel('email')}
                        className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer"
                      >
                        cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave('email')}
                        disabled={saving}
                        className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer disabled:opacity-50"
                      >
                        save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-[13px] font-light text-[#1A1A1A]">{email || '-'}</p>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extralight lowercase tracking-wider text-[#AAAAAA]">phone</p>
                  <button type="button" onClick={() => handleEditToggle('phone')} aria-label="휴대폰 번호 수정">
                    <PencilIcon />
                  </button>
                </div>
                {isEditingPhone ? (
                  <div className="mt-2 space-y-3">
                    <input
                      type="tel"
                      value={draftPhone}
                      onChange={(e) => setDraftPhone(e.target.value)}
                      className="w-full bg-transparent border-b border-[#E5E5E5] py-3 px-2 text-[13px] font-light text-[#1A1A1A] outline-none focus:border-black transition-colors"
                      placeholder="휴대폰 번호"
                    />
                    <div className="mt-4 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => handleEditCancel('phone')}
                        className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer"
                      >
                        cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave('phone')}
                        disabled={saving}
                        className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer disabled:opacity-50"
                      >
                        save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-[13px] font-light text-[#1A1A1A]">{phone || '-'}</p>
                )}
              </div>
            </section>

            <section className="mt-5 rounded-md border border-[#E5E5E5] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extralight lowercase tracking-wider text-[#AAAAAA]">addresses</p>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="text-[11px] font-extralight lowercase tracking-wider text-[#777777]"
                >
                  + add
                </button>
              </div>
              {isEditingAddress ? (
                <div className="mt-3 space-y-3">
                  <AddressInput
                    addressValue={draftAddressBase}
                    onAddressChange={setDraftAddressBase}
                    detailValue={draftAddressDetail}
                    onDetailChange={setDraftAddressDetail}
                    className="space-y-2"
                    inputClassName="border border-[#EDEDED]"
                  />
                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => handleEditCancel('address')}
                      className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer"
                    >
                      cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('address')}
                      disabled={saving}
                      className="text-[11px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A] cursor-pointer disabled:opacity-50"
                    >
                      save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="text-[13px] font-light text-[#1A1A1A]">{displayAddress}</p>
                  <button type="button" onClick={() => handleEditToggle('address')} aria-label="주소 수정">
                    <PencilIcon />
                  </button>
                </div>
              )}
            </section>

            <div className="mt-8 flex gap-6">
              <Link to="/orders" className="text-[11px] font-light lowercase tracking-wider text-[#1A1A1A]">
                orders
              </Link>
              <Link to="/" className="text-[11px] font-light lowercase tracking-wider text-[#777777]">
                home
              </Link>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="text-[10px] font-extralight lowercase tracking-tight text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                회원 탈퇴
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
