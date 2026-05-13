'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPhone, validateEmail } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

function validatePassword(password: string) {
  const hasLength = password.length >= 8 && password.length <= 16;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return { hasLength, hasLetter, hasNumber, isValid: hasLength && hasLetter && hasNumber };
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', birthday: '', phone: '', email: '', password: '', passwordConfirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const passValidation = validatePassword(form.password);
  const passwordsMatch = form.password === form.passwordConfirm && form.password.length > 0;
  const emailValid = form.email.length > 0 && validateEmail(form.email);

  const allFilled =
    form.name.trim().length > 0 &&
    form.birthday.length > 0 &&
    form.phone.length > 0 &&
    form.email.length > 0 &&
    form.password.length > 0 &&
    form.passwordConfirm.length > 0;

  const isSubmitDisabled =
    loading ||
    !allFilled ||
    !emailValid ||
    !passValidation.isValid ||
    !passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailValid) {
      setErrorMsg('올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (!passValidation.isValid) {
      setErrorMsg('비밀번호: 8~16자, 영문자·숫자를 포함해야 합니다.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { name: form.name.trim() } },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already') || msg.includes('registered') || msg.includes('exists') || msg.includes('taken')) {
          setErrorMsg('이미 가입된 이메일입니다. 로그인 페이지에서 로그인해주세요.');
        } else if (msg.includes('password')) {
          setErrorMsg('비밀번호가 조건에 맞지 않습니다. 다시 확인해주세요.');
        } else if (msg.includes('rate') || msg.includes('limit')) {
          setErrorMsg('잠시 후 다시 시도해주세요. (요청 횟수 초과)');
        } else if (msg.includes('invalid') && msg.includes('email')) {
          setErrorMsg('유효하지 않은 이메일 주소입니다.');
        } else {
          setErrorMsg(`오류: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      // 프로필 저장 (에러 무시)
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: form.name.trim(),
          phone: form.phone,
          birthday: form.birthday,
        });
      }

      // 가입 직후 바로 로그인 (이메일 인증 없이)
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        if (loginError) {
          // 자동 로그인 실패 시 로그인 페이지로 (이메일 인증이 켜져 있는 경우)
          router.replace('/login');
        } else {
          router.replace('/home');
        }
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      setLoading(false);
      setErrorMsg('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-picks-bg px-7">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-[22px] font-bold text-picks-dark mb-2">회원가입 완료!</h2>
        <p className="text-[14px] text-gray-400 text-center">잠시 후 자동으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">
      <div className="flex items-center px-7 pt-14" style={{ height: '64px' }}>
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-7 pt-4 pb-20 overflow-y-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: '#D6536D', fontFamily: "'Bricolage Grotesk', sans-serif" }}>
          PICKS
        </h1>
        <p className="text-[15px] text-gray-500 mb-8">새로운 계정을 만들어보세요</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* 이름 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">이름 또는 닉네임 <span className="text-picks-red">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="이름 또는 닉네임"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose focus:outline-none transition-colors"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">생년월일 <span className="text-picks-red">*</span></label>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm((p) => ({ ...p, birthday: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose focus:outline-none transition-colors"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">연락처 <span className="text-picks-red">*</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose focus:outline-none transition-colors"
              maxLength={13}
              inputMode="numeric"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">이메일 (아이디) <span className="text-picks-red">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm((p) => ({ ...p, email: e.target.value }));
                setErrorMsg('');
              }}
              placeholder="example@email.com"
              autoComplete="email"
              inputMode="email"
              className={`w-full px-4 py-3.5 rounded-xl border bg-white text-[15px] text-picks-dark focus:outline-none transition-colors ${
                form.email.length > 0 && !emailValid
                  ? 'border-picks-red'
                  : form.email.length > 0 && emailValid
                  ? 'border-green-400'
                  : 'border-gray-200'
              }`}
            />
            {form.email.length > 0 && !emailValid && (
              <p className="text-[12px] text-picks-red mt-1">올바른 이메일 형식이 아닙니다.</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">비밀번호 <span className="text-picks-red">*</span></label>
            <p className="text-[11px] text-gray-400 mb-1.5">8~16자, 영문자·숫자 조합</p>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose focus:outline-none transition-colors pr-12"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <EyeIcon open={showPass} />
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2 flex gap-3">
                {[
                  { label: '8~16자', ok: passValidation.hasLength },
                  { label: '영문 포함', ok: passValidation.hasLetter },
                  { label: '숫자 포함', ok: passValidation.hasNumber },
                ].map((req) => (
                  <span key={req.label} className={`text-[11px] flex items-center gap-1 ${req.ok ? 'text-green-500' : 'text-gray-400'}`}>
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
                className={`w-full px-4 py-3.5 rounded-xl border bg-white text-[15px] text-picks-dark focus:outline-none transition-colors pr-12 ${
                  form.passwordConfirm.length > 0
                    ? passwordsMatch
                      ? 'border-green-400'
                      : 'border-picks-red'
                    : 'border-gray-200'
                }`}
              />
              <button type="button" onClick={() => setShowPassConfirm(!showPassConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <EyeIcon open={showPassConfirm} />
              </button>
            </div>
            {form.passwordConfirm.length > 0 && (
              <p className={`text-[12px] mt-1 ${passwordsMatch ? 'text-green-500' : 'text-picks-red'}`}>
                {passwordsMatch ? '비밀번호가 일치합니다!' : '비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="px-4 py-3 rounded-xl text-[13px] text-picks-red text-center" style={{ background: '#fdf0f2' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white mt-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                처리 중...
              </span>
            ) : '회원가입'}
          </button>

          <p className="text-center text-[13px] text-gray-400">
            이미 계정이 있으신가요?{' '}
            <button type="button" onClick={() => router.push('/login')} className="font-semibold" style={{ color: '#D6536D' }}>
              로그인
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
