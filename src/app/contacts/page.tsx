'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { getDaysAgo, getDaysUntilBirthday, formatBirthday } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { Connection } from '@/lib/types';

const bannerGradients = [
  'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)',
  'linear-gradient(135deg, #EFB11D 0%, #D6536D 100%)',
  'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
];

export default function ContactsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('전체');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [search, setSearch] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [categories, setCategories] = useState<string[]>(['전체', '친구', '가족', '비즈니스']);
  const [dataLoading, setDataLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setDataLoading(true);
      const [{ data: conns }, { data: cats }] = await Promise.all([
        supabase.from('connections').select('*').eq('user_id', user.id).order('name'),
        supabase.from('user_categories').select('*').eq('user_id', user.id),
      ]);
      setConnections((conns as Connection[]) ?? []);
      const customCats = (cats ?? []).map((c: { name: string }) => c.name);
      const allCats = ['전체', '친구', '가족', '비즈니스', ...customCats.filter((c: string) => !['친구', '가족', '비즈니스'].includes(c))];
      setCategories(allCats);
      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % Math.max(bannerData.length, 1));
    }, 3000);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections.length]);

  const bannerData = connections
    .filter((c) => c.birthday)
    .map((c) => ({ ...c, daysUntil: getDaysUntilBirthday(c.birthday!) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  const allCategories = [...categories, '+'];
  const byCat = activeCategory === '전체'
    ? connections
    : connections.filter((c) => c.category === activeCategory);
  const filtered = search.trim()
    ? byCat.filter((c) => c.name.includes(search) || (c.phone ?? '').includes(search))
    : byCat;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">
      <TopBar />

      <div className="flex-1 overflow-y-auto pb-36" style={{ paddingTop: '64px' }}>
        {/* Recommendation banner */}
        <div className="px-7 pt-4">
          <Link href="/contacts/bulk-send" className="block">
            <div className="relative overflow-hidden rounded-2xl" style={{ height: '100px' }}>
              {dataLoading ? (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: bannerGradients[0] }}>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : bannerData.length > 0 ? (
                bannerData.map((person, idx) => (
                  <div
                    key={person.id}
                    className="absolute inset-0 p-5 flex items-center transition-opacity duration-500"
                    style={{
                      background: bannerGradients[idx % bannerGradients.length],
                      opacity: idx === currentBanner ? 1 : 0,
                      pointerEvents: idx === currentBanner ? 'auto' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="text-white/80 text-[11px] font-medium mb-1">생일 알림</p>
                        <p className="text-white text-[16px] font-bold">
                          {person.name} 님의 생일이 {person.daysUntil}일 후입니다!
                        </p>
                        <p className="text-white/70 text-[12px] mt-0.5">{formatBirthday(person.birthday!)} · 메시지 보내기 →</p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ml-4"
                        style={{ background: 'rgba(255,255,255,0.25)' }}
                      >
                        {person.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 p-5 flex items-center" style={{ background: bannerGradients[0] }}>
                  <p className="text-white text-[14px] font-semibold">관계를 추가하고 생일 알림을 받아보세요!</p>
                </div>
              )}
            </div>
          </Link>
          {/* Dots */}
          {bannerData.length > 0 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {bannerData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className="transition-all"
                  style={{
                    width: idx === currentBanner ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: idx === currentBanner ? '#D6536D' : '#e0e0e0',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 검색 */}
        <div className="mt-4 px-7">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 또는 번호로 검색"
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white border border-gray-100 text-[14px] text-picks-dark shadow-card"
              style={{ outline: 'none' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-4 px-7">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === '+') {
                    router.push('/contacts/category');
                  } else {
                    setActiveCategory(cat);
                  }
                }}
                className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
                style={{
                  background: activeCategory === cat && cat !== '+' ? '#D6536D' : 'white',
                  color: activeCategory === cat && cat !== '+' ? 'white' : cat === '+' ? '#D6536D' : '#666',
                  border: cat === '+' ? '1.5px dashed #D6536D' : activeCategory === cat ? 'none' : '1.5px solid #e5e5e5',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Contact count */}
        <div className="px-7 mt-4 mb-2">
          <p className="text-[13px] text-gray-400">{filtered.length}명</p>
        </div>

        {/* Contact list */}
        <div className="px-7 space-y-3">
          {dataLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="picks-card p-8 text-center">
              <p className="text-gray-400 text-[14px]">연락처가 없습니다</p>
              <Link href="/contacts/new" className="text-[13px] font-semibold mt-2 block" style={{ color: '#D6536D' }}>
                + 관계 추가하기
              </Link>
            </div>
          ) : (
            filtered.map((contact) => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="picks-card p-4 flex items-center gap-3 block active:scale-95 transition-transform"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: contact.avatar_color }}
                >
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-picks-dark">{contact.name}</p>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: '#fdf0f2', color: '#D6536D' }}
                    >
                      {contact.category}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    마지막 연락: {contact.last_contact ? getDaysAgo(contact.last_contact) : '기록 없음'}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Fixed bottom bulk send button */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[393px] px-7 pb-3 z-30" style={{ background: 'linear-gradient(to top, #fafaf8 80%, transparent)' }}>
        <Link
          href="/contacts/bulk-send"
          className="block w-full py-3.5 rounded-2xl text-center font-semibold text-[15px] text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
        >
          일괄 전송하기
        </Link>
      </div>

      {/* FAB */}
      <Link
        href="/contacts/new"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30 active:scale-95 transition-transform"
        style={{ background: '#D6536D' }}
        aria-label="연락처 추가"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

      <BottomNav />
    </div>
  );
}
