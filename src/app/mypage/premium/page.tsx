'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'monthly',
    label: '월간 구독',
    price: '₩4,900',
    period: '/ 월',
    badge: '',
    desc: '매월 자동 결제',
  },
  {
    id: 'yearly',
    label: '연간 구독',
    price: '₩29,900',
    period: '/ 년',
    badge: '37% 절약',
    desc: '월 ₩2,491 · 연 1회 결제',
  },
];

const features = [
  { icon: '📊', title: '관계 분석 리포트', desc: '월별 관계 활동을 분석한 상세 리포트를 제공합니다' },
  { icon: '✉️', title: '오프라인 편지 발송', desc: '한 달에 최대 3번까지 오프라인 편지 발송 서비스를 제공합니다' },
];

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setToast('프리미엄 구독이 시작되었습니다! 🎉');
    setTimeout(() => router.push('/mypage'), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">

      {/* 헤더 */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', background: 'transparent' }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </div>

      {/* 히어로 섹션 */}
      <div
        className="flex flex-col items-center justify-center px-7 pb-10"
        style={{
          background: 'linear-gradient(160deg, #1a1a1a 0%, #2d1a2e 50%, #1a1a1a 100%)',
          minHeight: '280px',
          paddingTop: '80px',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">👑</span>
          <span
            className="text-[28px] font-bold text-white"
            style={{ fontFamily: "'Bricolage Grotesk', sans-serif" }}
          >
            PICKS Premium
          </span>
        </div>
        <p className="text-white/60 text-[14px] text-center leading-relaxed">
          소중한 관계를 더 깊이, 더 스마트하게<br />관리하세요
        </p>
        <div className="flex gap-2 mt-5 flex-wrap justify-center">
          {['분석 리포트', '오프라인 편지'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[12px] font-semibold"
              style={{ background: 'rgba(239,177,29,0.2)', color: '#EFB11D', border: '1px solid rgba(239,177,29,0.3)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-36">

        {/* 요금제 선택 */}
        <div className="px-7 mt-6">
          <h3 className="text-[16px] font-bold text-picks-dark mb-3">요금제 선택</h3>
          <div className="space-y-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className="w-full picks-card p-4 flex items-center gap-4 transition-all active:scale-95"
                style={{
                  border: selectedPlan === plan.id ? '2px solid #D6536D' : '2px solid transparent',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    borderColor: selectedPlan === plan.id ? '#D6536D' : '#ccc',
                    background: selectedPlan === plan.id ? '#D6536D' : 'white',
                  }}
                >
                  {selectedPlan === plan.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-picks-dark">{plan.label}</p>
                    {plan.badge && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: '#EFB11D', color: '#1a1a1a' }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">{plan.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[18px] font-bold" style={{ color: '#D6536D' }}>{plan.price}</p>
                  <p className="text-[11px] text-gray-400">{plan.period}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 기능 목록 */}
        <div className="px-7 mt-8">
          <h3 className="text-[16px] font-bold text-picks-dark mb-4">프리미엄 혜택</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feat) => (
              <div key={feat.title} className="picks-card p-4 flex flex-col gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#fdf0f2' }}
                >
                  {feat.title === '오프라인 편지 발송' ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <polyline points="2,4 12,13 22,4" />
                      <line x1="2" y1="20" x2="8" y2="14" />
                      <line x1="22" y1="20" x2="16" y2="14" />
                    </svg>
                  ) : (
                    <span className="text-xl">{feat.icon}</span>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-picks-dark">{feat.title}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 이용약관 */}
        <div className="px-7 mt-6 mb-4">
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            구독은 언제든지 취소할 수 있습니다. 결제는 선택한 주기로 자동 갱신되며,
            갱신 24시간 전까지 취소 가능합니다.
          </p>
        </div>
      </div>

      {/* 구독 버튼 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] px-7 pb-8 pt-4 z-30"
        style={{ background: 'linear-gradient(to top, #fafaf8 80%, transparent)' }}
      >
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-[16px] text-white transition-all active:scale-95 disabled:opacity-70"
          style={{ background: 'linear-gradient(135deg, #EFB11D 0%, #E43D12 100%)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              처리 중...
            </span>
          ) : `${selectedPlan === 'yearly' ? '₩29,900/년' : '₩4,900/월'}으로 시작하기`}
        </button>
        <p className="text-[11px] text-gray-400 text-center mt-2">7일 무료 체험 후 자동 결제됩니다</p>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
