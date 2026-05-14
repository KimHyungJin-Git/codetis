'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPhone } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { Profile } from '@/lib/types';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    phone: '',
    birthday: '',
    email: '',
  });
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setDataLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        const p = data as Profile;
        setForm({
          name: p.name ?? '',
          nickname: p.nickname ?? '',
          phone: p.phone ?? '',
          birthday: p.birthday ?? '',
          email: user.email ?? '',
        });
      }
      setDataLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: form.name,
        nickname: form.nickname,
        phone: form.phone,
        birthday: form.birthday || null,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);

    if (error) {
      setToast('저장 중 오류가 발생했습니다.');
    } else {
      setEditing(false);
      setToast('계정 정보가 저장되었습니다.');
    }
    setTimeout(() => setToast(''), 2000);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">

      {/* 헤더 */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7 bg-picks-bg"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[17px] font-bold text-picks-dark">계정 관리</span>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
          className="text-[14px] font-semibold disabled:opacity-60"
          style={{ color: '#D6536D' }}
        >
          {saving ? '저장 중...' : editing ? '저장' : '편집'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-16" style={{ paddingTop: '56px' }}>

        {/* 프로필 아바타 */}
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-card-md"
              style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
            >
              {form.name.charAt(0) || '?'}
            </div>
            {editing && (
              <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-card"
                style={{ background: '#D6536D' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-[18px] font-bold text-picks-dark mt-3">{form.name || '이름 없음'}</p>
          <p className="text-[13px] text-gray-400 mt-0.5">{form.email}</p>
        </div>

        <div className="px-7 space-y-3">

          {/* 이름 */}
          <div className="picks-card p-4">
            <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">이름</p>
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full text-[15px] text-picks-dark bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus:border-picks-rose transition-colors"
              />
            ) : (
              <p className="text-[16px] font-semibold text-picks-dark">{form.name || '-'}</p>
            )}
          </div>

          {/* 닉네임 */}
          <div className="picks-card p-4">
            <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">닉네임</p>
            {editing ? (
              <input
                value={form.nickname}
                onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
                className="w-full text-[15px] text-picks-dark bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus:border-picks-rose transition-colors"
              />
            ) : (
              <p className="text-[16px] font-semibold text-picks-dark">{form.nickname || '-'}</p>
            )}
          </div>

          {/* 연락처 */}
          <div className="picks-card p-4">
            <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">연락처</p>
            {editing ? (
              <input
                type="tel"
                value={form.phone}
                onChange={handlePhoneChange}
                maxLength={13}
                className="w-full text-[15px] text-picks-dark bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus:border-picks-rose transition-colors"
              />
            ) : (
              <p className="text-[16px] font-semibold text-picks-dark">{form.phone || '-'}</p>
            )}
          </div>

          {/* 생년월일 */}
          <div className="picks-card p-4">
            <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">생년월일</p>
            {editing ? (
              <div className="flex gap-2">
                <select
                  value={form.birthday ? form.birthday.split('-')[0] : ''}
                  onChange={(e) => {
                    const parts = form.birthday ? form.birthday.split('-') : ['', '01', '01'];
                    setForm((p) => ({ ...p, birthday: `${e.target.value}-${parts[1] || '01'}-${parts[2] || '01'}` }));
                  }}
                  className="flex-1 text-[15px] text-picks-dark bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus:border-picks-rose transition-colors appearance-none"
                >
                  <option value="">년</option>
                  {Array.from({ length: 80 }, (_, i) => 2010 - i).map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
                <select
                  value={form.birthday ? form.birthday.split('-')[1] : ''}
                  onChange={(e) => {
                    const parts = form.birthday ? form.birthday.split('-') : ['2000', '', '01'];
                    setForm((p) => ({ ...p, birthday: `${parts[0] || '2000'}-${e.target.value}-${parts[2] || '01'}` }));
                  }}
                  className="w-[72px] text-[15px] text-picks-dark bg-gray-50 rounded-xl px-2 py-2 border border-gray-200 focus:border-picks-rose transition-colors appearance-none"
                >
                  <option value="">월</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m).padStart(2, '0')}>{m}월</option>
                  ))}
                </select>
                <select
                  value={form.birthday ? form.birthday.split('-')[2] : ''}
                  onChange={(e) => {
                    const parts = form.birthday ? form.birthday.split('-') : ['2000', '01', ''];
                    setForm((p) => ({ ...p, birthday: `${parts[0] || '2000'}-${parts[1] || '01'}-${e.target.value}` }));
                  }}
                  className="w-[72px] text-[15px] text-picks-dark bg-gray-50 rounded-xl px-2 py-2 border border-gray-200 focus:border-picks-rose transition-colors appearance-none"
                >
                  <option value="">일</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d).padStart(2, '0')}>{d}일</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-[16px] font-semibold text-picks-dark">{form.birthday ? form.birthday.replace(/-/g, '.') : '-'}</p>
            )}
          </div>

          {/* 이메일 (읽기 전용) */}
          <div className="picks-card p-4">
            <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">이메일 (아이디)</p>
            <p className="text-[15px] text-gray-500">{form.email}</p>
            <p className="text-[11px] text-gray-400 mt-1">이메일은 변경할 수 없습니다.</p>
          </div>

          {/* 비밀번호 변경 */}
          <button
            className="picks-card p-4 flex items-center justify-between w-full active:scale-95 transition-transform"
          >
            <div>
              <p className="text-[15px] font-semibold text-picks-dark text-left">비밀번호 변경</p>
              <p className="text-[12px] text-gray-400 mt-0.5 text-left">이메일로 비밀번호 재설정 링크를 받으세요</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* 구분 */}
          <div className="pt-2 pb-1">
            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-1">계정 관련</p>
          </div>

          {/* 회원 탈퇴 */}
          <button
            onClick={() => setShowWithdraw(true)}
            className="picks-card p-4 flex items-center gap-3 w-full active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef2f2' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E43D12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <span className="text-[15px] font-medium flex-1 text-left" style={{ color: '#E43D12' }}>회원 탈퇴</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E43D12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

        </div>
      </div>

      {/* 탈퇴 확인 모달 */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-[393px] bg-white rounded-t-3xl p-6 bottom-sheet">
            <h3 className="text-[18px] font-bold text-picks-dark text-center mb-2">정말 탈퇴하시겠어요?</h3>
            <p className="text-[14px] text-gray-400 text-center leading-relaxed mb-6">
              탈퇴 시 모든 관계 데이터, 일정, 템플릿이<br />영구적으로 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-[15px] bg-gray-100 text-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-[15px] text-white"
                style={{ background: '#E43D12' }}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
