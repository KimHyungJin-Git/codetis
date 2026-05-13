'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BulkResult {
  sent: string[];
  failed: string[];
  total: number;
}

export default function BulkSendResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<BulkResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('bulkSendResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.replace('/contacts/bulk-send');
    }
  }, []);

  if (!result) {
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
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-center px-7 bg-picks-bg"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <span className="text-[17px] font-bold text-picks-dark">전송 결과</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-28" style={{ paddingTop: '72px' }}>
        {/* Success count */}
        <div className="flex flex-col items-center py-10">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[52px] font-bold" style={{ color: '#D6536D' }}>{result.total}</p>
          <p className="text-[20px] font-semibold text-picks-dark mt-1">명에게 전송 완료!</p>
          <p className="text-[14px] text-gray-400 mt-2">메시지가 성공적으로 전송되었습니다</p>
        </div>

        {/* Sent list */}
        {result.sent.length > 0 && (
          <div className="px-7 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[16px]">✅</span>
              <h3 className="text-[15px] font-bold text-picks-dark">전송 완료 ({result.sent.length}명)</h3>
            </div>
            <div className="picks-card overflow-hidden">
              <div className="overflow-y-auto max-h-48">
                {result.sent.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: '#D6536D' }}
                    >
                      {name.charAt(0)}
                    </div>
                    <span className="text-[14px] font-medium text-picks-dark flex-1">{name}</span>
                    <span className="text-green-500 text-[18px]">✅</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Failed list */}
        {result.failed.length > 0 && (
          <div className="px-7 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[16px]">❌</span>
              <h3 className="text-[15px] font-bold text-picks-dark">미전송 ({result.failed.length}명)</h3>
            </div>
            <div className="picks-card overflow-hidden">
              <div className="overflow-y-auto max-h-48">
                {result.failed.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: '#9e9e9e' }}
                    >
                      {name.charAt(0)}
                    </div>
                    <span className="text-[14px] font-medium text-gray-500 flex-1">{name}</span>
                    <span className="text-[18px]">❌</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Done button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] px-7 pb-8 pt-4 z-30 bg-picks-bg">
        <button
          onClick={() => router.push('/contacts')}
          className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
        >
          완료
        </button>
      </div>
    </div>
  );
}
