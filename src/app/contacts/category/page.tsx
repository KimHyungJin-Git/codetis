'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { Connection } from '@/lib/types';

export default function CategoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categoryName, setCategoryName] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchConnections = async () => {
      setDataLoading(true);
      const { data } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      setConnections((data as Connection[]) ?? []);
      setDataLoading(false);
    };
    fetchConnections();
  }, [user]);

  const filtered = connections.filter((c) =>
    c.name.includes(search) || (c.phone ?? '').includes(search)
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !user) return;
    setLoading(true);

    // Create the category
    await supabase
      .from('user_categories')
      .insert({ user_id: user.id, name: categoryName });

    // Update selected connections to this category
    const selectedIds = Array.from(selected);
    for (const id of selectedIds) {
      await supabase
        .from('connections')
        .update({ category: categoryName })
        .eq('id', id);
    }

    setLoading(false);
    setToast(`'${categoryName}' 카테고리가 생성되었습니다!`);
    setTimeout(() => router.push('/contacts'), 1500);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">
      {/* Header */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7 bg-picks-bg"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[17px] font-bold text-picks-dark">카테고리 만들기</span>
        <div className="w-8" />
      </div>

      <form onSubmit={handleCreate} className="flex-1 overflow-y-auto pb-10" style={{ paddingTop: '72px' }}>
        <div className="px-7 flex flex-col gap-6">
          {/* Category name */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              카테고리 이름 <span className="text-picks-red">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="예: 동창, 직장 동료..."
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
            />
          </div>

          {/* People selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-picks-dark">인물 추가</p>
              <span className="text-[13px] text-gray-400">{selected.size}명 선택됨</span>
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름 또는 연락처 검색"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-picks-dark focus:border-picks-rose transition-colors"
              />
            </div>
            <div className="space-y-2">
              {dataLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                filtered.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => toggle(contact.id)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-white shadow-card hover:shadow-card-md transition-shadow"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        selected.has(contact.id) ? 'bg-picks-rose border-picks-rose' : 'border-gray-300'
                      }`}
                    >
                      {selected.has(contact.id) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                      style={{ background: contact.avatar_color }}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[14px] font-semibold text-picks-dark">{contact.name}</p>
                      <p className="text-[12px] text-gray-400">{contact.phone}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: '#fdf0f2', color: '#D6536D' }}
                    >
                      {contact.category}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !categoryName}
            className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                생성 중...
              </span>
            ) : '생성하기'}
          </button>
        </div>
      </form>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
