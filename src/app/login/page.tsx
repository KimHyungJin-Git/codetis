'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    router.replace('/home');
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

      <div className="flex-1 px-7 pt-6">
        {/* Logo */}
        <h1
          className="text-4xl font-bold tracking-tight mb-1"
          style={{ color: '#D6536D', fontFamily: "'Bricolage Grotesk', sans-serif" }}
        >
          PICKS
        </h1>
        <p className="text-[15px] text-gray-500 mb-10">다시 만나서 반가워요!</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">비밀번호</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[13px] text-picks-red">{error}</p>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white mt-2 transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                로그인 중...
              </span>
            ) : '로그인'}
          </button>
        </form>

        <div className="flex items-center justify-center mt-6">
          <span className="text-[14px] text-gray-400">계정이 없으신가요?</span>
          <Link href="/signup" className="ml-2 text-[14px] font-semibold" style={{ color: '#D6536D' }}>
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
