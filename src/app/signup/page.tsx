'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPhone, validateEmail, validatePassword } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    birthday: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [emailStatus, setEmailStatus] = useState<'idle' | 'available' | 'unavailable'>('idle');
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const passValidation = validatePassword(form.password);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, email: val }));
    if (validateEmail(val)) {
      await new Promise((r) => setTimeout(r, 400));
      // We'll validate after submission; just show idle for now
      setEmailStatus('idle');
    } else {
      setEmailStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.birthday || !form.phone || !form.email || !form.password || !form.passwordConfirm) return;
    if (!passValidation.isValid) return;
    if (form.password !== form.passwordConfirm) return;
    if (emailStatus === 'unavailable') return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
        },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setEmailStatus('unavailable');
      } else {
        setEmailStatus('unavailable');
      }
      return;
    }

    // Update profile with additional info
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('profiles').update({
        name: form.name,
        phone: form.phone,
        birthday: form.birthday,
      }).eq('id', session.user.id);
    }

    setEmailStatus('available');
    setToast(true);
    setTimeout(() => {
      router.push('/login');
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">
      {/* Header */}
      <div className="flex items-center px-7 pt-14" style={{ height: '64px' }}>
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-7 pt-4 pb-20 overflow-y-auto">
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: '#D6536D', fontFamily: "'Bricolage Grotesk', sans-serif" }}
        >
          PICKS
        </h1>
        <p className="text-[15px] text-gray-500 mb-8">새로운 계정을 만들어보세요</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 이름 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">이름/닉네임 <span className="text-picks-red">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="이름 또는 닉네임"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">생년월일 <span className="text-picks-red">*</span></label>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm((p) => ({ ...p, birthday: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">연락처 <span className="text-picks-red">*</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
              maxLength={13}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">아이디(이메일) <span className="text-picks-red">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={handleEmailChange}
              placeholder="example@email.com"
              className={`w-full px-4 py-3.5 rounded-xl border bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors ${
                emailStatus === 'unavailable' ? 'border-picks-red' :
                emailStatus === 'available' ? 'border-green-400' : 'border-gray-200'
              }`}
            />
            {emailStatus === 'available' && (
              <p className="text-[12px] text-green-500 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="2,6 5,9 10,3" /></svg>
                사용 가능한 아이디입니다!
              </p>
            )}
            {emailStatus === 'unavailable' && (
              <p className="text-[12px] text-picks-red mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" /></svg>
                사용 불가능한 아이디입니다.
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">비밀번호 <span className="text-picks-red">*</span></label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="8-16자, 영문 대/소문자, 숫자, 특수문자"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors pr-12"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {[
                  { label: '8-16자', ok: passValidation.hasLength },
                  { label: '대문자 포함', ok: passValidation.hasUpper },
                  { label: '소문자 포함', ok: passValidation.hasLower },
                  { label: '숫자 포함', ok: passValidation.hasNumber },
                  { label: '특수문자 포함', ok: passValidation.hasSpecial },
                ].map((req) => (
                  <span
                    key={req.label}
                    className={`text-[11px] flex items-center gap-1 ${req.ok ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {req.ok ? '✓' : '○'} {req.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">비밀번호 확인 <span className="text-picks-red">*</span></label>
            <div className="relative">
              <input
                type={showPassConfirm ? 'text' : 'password'}
                value={form.passwordConfirm}
                onChange={(e) => setForm((p) => ({ ...p, passwordConfirm: e.target.value }))}
                placeholder="비밀번호를 다시 입력하세요"
                className={`w-full px-4 py-3.5 rounded-xl border bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors pr-12 ${
                  form.passwordConfirm.length > 0
                    ? form.password === form.passwordConfirm
                      ? 'border-green-400'
                      : 'border-picks-red'
                    : 'border-gray-200'
                }`}
              />
              <button type="button" onClick={() => setShowPassConfirm(!showPassConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassConfirm ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {form.passwordConfirm.length > 0 && form.password !== form.passwordConfirm && (
              <p className="text-[12px] text-picks-red mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passValidation.isValid || form.password !== form.passwordConfirm || emailStatus === 'unavailable'}
            className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white mt-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                처리 중...
              </span>
            ) : '회원가입'}
          </button>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3.5 rounded-2xl shadow-lg text-[14px] font-medium max-w-[320px] text-center">
            이메일로 인증 메일이 발송되었습니다! 🎉
          </div>
        </div>
      )}
    </div>
  );
}
