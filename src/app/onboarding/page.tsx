'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPhone } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

interface PhoneContact {
  id: string;
  name: string;
  phone: string;
}

const AVATAR_COLORS = ['#D6536D', '#EFB11D', '#E43D12', '#FFA2B6', '#4CAF50', '#2196F3'];

async function fetchPhoneContacts(): Promise<PhoneContact[] | null> {
  if (typeof navigator !== 'undefined' && 'contacts' in navigator) {
    try {
      // @ts-expect-error contacts API is experimental
      const raw = await navigator.contacts.select(['name', 'tel'], { multiple: true });
      return (raw as Array<{ name?: string[]; tel?: string[] }>).map((c, i) => ({
        id: `phone-${i}`,
        name: c.name?.[0] ?? '이름 없음',
        phone: formatPhone(c.tel?.[0] ?? ''),
      }));
    } catch {
      return null;
    }
  }
  return null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  // 로그인된 사용자는 바로 연락처 연동 화면으로
  const [isLoggedInMode, setIsLoggedInMode] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setIsLoggedInMode(true);
    }
  }, [user, authLoading]);

  const [showSyncPopup, setShowSyncPopup] = useState(false);
  const [contactList, setContactList] = useState<PhoneContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 자동 전체 연동
  const handleAutoSync = async () => {
    setSyncing(true);
    const real = await fetchPhoneContacts();
    setSyncing(false);

    if (!real || real.length === 0) {
      showToast('연락처를 불러올 수 없습니다.\n기기 설정에서 연락처 접근 권한을 확인해주세요.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userId = session.user.id;
      for (let i = 0; i < real.length; i++) {
        await supabase.from('connections').insert({
          user_id: userId,
          name: real[i].name,
          phone: real[i].phone,
          category: '친구',
          avatar_color: AVATAR_COLORS[i % AVATAR_COLORS.length],
          last_contact: new Date().toISOString().split('T')[0],
        });
      }
      await supabase.from('user_categories').upsert(
        { user_id: userId, name: '친구' },
        { onConflict: 'user_id,name' }
      );
    } else {
      const guestContacts = real.map((c, i) => ({
        id: `guest-${i}`,
        user_id: 'guest',
        name: c.name,
        phone: c.phone,
        category: '친구',
        avatar_color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        last_contact: new Date().toISOString().split('T')[0],
      }));
      localStorage.setItem('picks_guest_contacts', JSON.stringify(guestContacts));
      localStorage.setItem('picks_is_guest', 'true');
    }

    showToast(`${real.length}명의 연락처가 연동됐어요!`);
    setTimeout(() => router.push('/home'), 2000);
  };

  // 수동 연동 — 폰 연락처 피커 열기
  const handleOpenManual = async () => {
    setLoading(true);
    const real = await fetchPhoneContacts();
    setLoading(false);

    if (!real) {
      showToast('이 기기에서는 연락처 접근이 지원되지 않습니다.\n연락처 권한을 확인해주세요.');
      return;
    }
    if (real.length === 0) {
      showToast('선택된 연락처가 없습니다.');
      return;
    }
    setContactList(real);
    setSelected(new Set());
  };

  const toggleContact = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 저장 후 관계 상세 페이지로 이동
  const handleSaveAndGoDetail = async () => {
    if (selected.size === 0 || saving) return;
    setSaving(true);

    const picks = contactList.filter((c) => selected.has(c.id));
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const userId = session.user.id;
      const insertedIds: string[] = [];

      for (let i = 0; i < picks.length; i++) {
        const { data } = await supabase
          .from('connections')
          .insert({
            user_id: userId,
            name: picks[i].name,
            phone: picks[i].phone,
            category: '친구',
            avatar_color: AVATAR_COLORS[i % AVATAR_COLORS.length],
            last_contact: new Date().toISOString().split('T')[0],
          })
          .select('id')
          .single();
        if (data?.id) insertedIds.push(data.id);
      }

      setSaving(false);
      setShowSyncPopup(false);

      if (insertedIds.length === 1) {
        // 1명 → 바로 관계 상세 페이지
        router.push(`/contacts/${insertedIds[0]}`);
      } else {
        // 여러 명 → 관계 리스트 (각자 탭해서 입력)
        showToast(`${insertedIds.length}명이 저장됐어요!\n각 연락처를 탭해서 카테고리와 메모를 설정해보세요.`);
        setTimeout(() => router.push('/contacts'), 1800);
      }
    } else {
      // 비회원(게스트) → localStorage 저장 후 관계 리스트
      const existing: PhoneContact[] = (() => {
        try { return JSON.parse(localStorage.getItem('picks_guest_contacts') ?? '[]'); }
        catch { return []; }
      })();
      const newContacts = picks.map((c, i) => ({
        id: `guest-${Date.now()}-${i}`,
        user_id: 'guest',
        name: c.name,
        phone: c.phone,
        category: '친구',
        avatar_color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        last_contact: new Date().toISOString().split('T')[0],
      }));
      localStorage.setItem('picks_guest_contacts', JSON.stringify([...existing, ...newContacts]));
      localStorage.setItem('picks_is_guest', 'true');

      setSaving(false);
      setShowSyncPopup(false);
      showToast(`${picks.length}명이 저장됐어요!\n각 연락처를 탭해서 카테고리와 메모를 설정해보세요.`);
      setTimeout(() => router.push('/contacts'), 1800);
    }
  };

  // 로그인된 사용자 — 연락처 연동만 보여주기
  if (isLoggedInMode) {
    return (
      <div className="flex flex-col min-h-screen bg-picks-bg page-fade">
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7 bg-picks-bg"
          style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="w-8" />
          <span className="text-[17px] font-bold text-picks-dark">내 연락처 가져오기</span>
          <button onClick={() => router.replace('/home')} className="text-[13px] font-medium text-gray-400">건너뛰기</button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-7" style={{ paddingTop: '56px' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: '#fdf0f2' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold text-picks-dark mb-2 text-center">내 연락처를 가져와요</h2>
          <p className="text-[14px] text-gray-400 text-center leading-relaxed mb-10">
            핸드폰에 저장된 내 연락처를 PICKS에 연동하면<br />소중한 관계를 바로 관리할 수 있어요
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={handleAutoSync}
              disabled={syncing}
              className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white active:scale-95 transition-transform disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
            >
              {syncing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  연동 중...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  전체 연락처 한 번에 가져오기
                </span>
              )}
            </button>

            <button
              onClick={handleOpenManual}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-[15px] border-2 active:scale-95 transition-transform disabled:opacity-60"
              style={{ borderColor: '#D6536D', color: '#D6536D' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#D6536D', borderTopColor: 'transparent' }} />
                  불러오는 중...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  원하는 연락처만 골라서 추가
                </span>
              )}
            </button>

            <Link
              href="/contacts/new"
              className="w-full py-4 rounded-2xl font-semibold text-[15px] bg-white border border-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ color: '#666' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              직접 한 명씩 추가하기
            </Link>
          </div>
        </div>

        {/* 연락처 선택 시트 (로그인 모드에서도 동일하게) */}
        {contactList.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-[393px] bg-white rounded-t-3xl bottom-sheet flex flex-col" style={{ maxHeight: '88vh' }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => setContactList([])} className="p-1 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                </button>
                <div className="text-center">
                  <h3 className="text-[17px] font-bold text-picks-dark">연락처 선택</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{contactList.length}명 중 {selected.size}명 선택</p>
                </div>
                <button
                  onClick={() => {
                    if (selected.size === contactList.length) setSelected(new Set());
                    else setSelected(new Set(contactList.map((c) => c.id)));
                  }}
                  className="text-[13px] font-semibold"
                  style={{ color: '#D6536D' }}
                >
                  {selected.size === contactList.length ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              <div className="px-6 py-3 flex-shrink-0" style={{ background: '#fdf8f8' }}>
                <p className="text-[12px] text-gray-400 leading-relaxed">
                  선택 후 저장하면 <span className="font-semibold" style={{ color: '#D6536D' }}>관계 상세 페이지</span>에서 카테고리와 메모를 입력할 수 있어요
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-2">
                {contactList.map((c, idx) => (
                  <button key={c.id} onClick={() => toggleContact(c.id)} className="w-full flex items-center gap-3 py-3 rounded-xl px-2 active:bg-gray-50 transition-colors">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-colors"
                      style={{ background: selected.has(c.id) ? '#D6536D' : AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                    >
                      {selected.has(c.id) ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : c.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[15px] font-semibold text-picks-dark truncate">{c.name}</p>
                      <p className="text-[12px] text-gray-400">{c.phone || '번호 없음'}</p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selected.has(c.id) ? '#D6536D' : '#ddd', background: selected.has(c.id) ? '#D6536D' : 'white' }}
                    >
                      {selected.has(c.id) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                {selected.size === 1 && <p className="text-[12px] text-center text-gray-400 mb-2">1명 선택 → 바로 관계 상세 페이지로 이동해요</p>}
                {selected.size > 1 && <p className="text-[12px] text-center text-gray-400 mb-2">저장 후 관계 리스트에서 각각 상세 정보를 입력해요</p>}
                <button
                  onClick={handleSaveAndGoDetail}
                  disabled={selected.size === 0 || saving}
                  className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white active:scale-95 transition-transform disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />저장 중...
                    </span>
                  ) : selected.size === 0 ? '연락처를 선택해주세요' : selected.size === 1 ? '저장하고 상세 정보 입력하기 →' : `${selected.size}명 저장하고 관계 리스트로 이동 →`}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] toast-enter">
            <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[13px] font-medium max-w-[320px] text-center whitespace-pre-line leading-relaxed">
              {toast}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">

      {/* 메인 화면 */}
      <div className="flex-1 flex flex-col items-center justify-center px-7 pt-16">
        <div className="mb-8">
          <Image
            src="/icon.png"
            alt="PICKS 로고"
            width={112}
            height={112}
            className="rounded-3xl shadow-card-md"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-3" style={{ color: '#D6536D', fontFamily: "'Bricolage Grotesk', sans-serif" }}>PICKS</h1>
        <p className="text-[13px] font-medium tracking-widest text-gray-400 uppercase mb-2">픽스</p>
        <p className="text-center text-[18px] font-semibold text-picks-dark mt-4 leading-relaxed">소중한 관계를<br />픽스하세요</p>
        <p className="text-center text-[14px] text-gray-400 mt-3 leading-relaxed">생일, 기념일, 안부 — 모든 순간을<br />놓치지 않도록 도와드려요</p>
        <div className="flex gap-3 mt-10">
          <div className="w-2 h-2 rounded-full bg-picks-rose" />
          <div className="w-2 h-2 rounded-full bg-picks-pink" />
          <div className="w-2 h-2 rounded-full bg-picks-yellow" />
        </div>
      </div>

      <div className="px-7 mb-8">
        <div className="grid grid-cols-3 gap-3">
          {[{ icon: '🎂', label: '생일 알림' }, { icon: '💌', label: '일괄 메시지' }, { icon: '📅', label: '관계 캘린더' }].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-card">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[12px] font-medium text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div className="px-7 pb-12 flex flex-col gap-3">
        <Link
          href="/signup"
          className="w-full py-4 rounded-2xl text-center font-semibold text-[16px] text-white active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
        >
          회원가입
        </Link>
        <Link
          href="/login"
          className="w-full py-4 rounded-2xl text-center font-semibold text-[16px] border-2 active:scale-95 transition-transform"
          style={{ borderColor: '#D6536D', color: '#D6536D' }}
        >
          로그인
        </Link>
        <button
          onClick={() => setShowSyncPopup(true)}
          className="text-center text-[13px] font-medium text-gray-400 py-2"
        >
          먼저 연락처만 둘러보기
        </button>
      </div>

      {/* ── 연동 방식 선택 팝업 ── */}
      {showSyncPopup && contactList.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-[393px] bg-white rounded-t-3xl p-6 bottom-sheet">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#fdf0f2' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="text-[20px] font-bold text-picks-dark">연락처 연동</h3>
              <p className="text-[14px] text-gray-400 text-center mt-2 leading-relaxed">
                기기의 연락처를 PICKS에 연동하면<br />소중한 관계를 더 쉽게 관리할 수 있어요
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAutoSync}
                disabled={syncing}
                className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white active:scale-95 transition-transform disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
              >
                {syncing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    연동 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                    자동으로 전체 연동하기
                  </span>
                )}
              </button>

              <button
                onClick={handleOpenManual}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-[15px] border-2 active:scale-95 transition-transform disabled:opacity-60"
                style={{ borderColor: '#D6536D', color: '#D6536D' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#D6536D', borderTopColor: 'transparent' }} />
                    연락처 불러오는 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    원하는 연락처만 골라서 추가
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowSyncPopup(false)}
                className="w-full py-3 text-[14px] text-gray-400 font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 연락처 선택 시트 ── */}
      {showSyncPopup && contactList.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-[393px] bg-white rounded-t-3xl bottom-sheet flex flex-col" style={{ maxHeight: '88vh' }}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <button onClick={() => setContactList([])} className="p-1 text-gray-400">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <div className="text-center">
                <h3 className="text-[17px] font-bold text-picks-dark">연락처 선택</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{contactList.length}명 중 {selected.size}명 선택</p>
              </div>
              <button
                onClick={() => {
                  if (selected.size === contactList.length) setSelected(new Set());
                  else setSelected(new Set(contactList.map((c) => c.id)));
                }}
                className="text-[13px] font-semibold"
                style={{ color: '#D6536D' }}
              >
                {selected.size === contactList.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            <div className="px-6 py-3 flex-shrink-0" style={{ background: '#fdf8f8' }}>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                선택 후 저장하면 <span className="font-semibold" style={{ color: '#D6536D' }}>관계 상세 페이지</span>에서
                카테고리와 메모를 직접 입력할 수 있어요
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {contactList.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => toggleContact(c.id)}
                  className="w-full flex items-center gap-3 py-3 rounded-xl px-2 active:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-colors"
                    style={{ background: selected.has(c.id) ? '#D6536D' : AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                  >
                    {selected.has(c.id) ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : c.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[15px] font-semibold text-picks-dark truncate">{c.name}</p>
                    <p className="text-[12px] text-gray-400">{c.phone || '번호 없음'}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: selected.has(c.id) ? '#D6536D' : '#ddd',
                      background: selected.has(c.id) ? '#D6536D' : 'white',
                    }}
                  >
                    {selected.has(c.id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              {selected.size === 1 && (
                <p className="text-[12px] text-center text-gray-400 mb-2">1명 선택 → 바로 관계 상세 페이지로 이동해요</p>
              )}
              {selected.size > 1 && (
                <p className="text-[12px] text-center text-gray-400 mb-2">저장 후 관계 리스트에서 각각 상세 정보를 입력해요</p>
              )}
              <button
                onClick={handleSaveAndGoDetail}
                disabled={selected.size === 0 || saving}
                className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white active:scale-95 transition-transform disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    저장 중...
                  </span>
                ) : selected.size === 0 ? (
                  '연락처를 선택해주세요'
                ) : selected.size === 1 ? (
                  '저장하고 상세 정보 입력하기 →'
                ) : (
                  `${selected.size}명 저장하고 관계 리스트로 이동 →`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[13px] font-medium max-w-[320px] text-center whitespace-pre-line leading-relaxed">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
