'use client';

import Link from 'next/link';
import { mockNotifications } from '@/lib/mockData';

interface TopBarProps {
  showLogo?: boolean;
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function TopBar({
  showLogo = true,
  title,
  onBack,
  showBack = false,
  rightElement,
}: TopBarProps) {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7 bg-picks-bg"
      style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left side */}
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={onBack}
            className="mr-3 p-1 -ml-1"
            aria-label="뒤로가기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        {showLogo && !showBack && (
          <Link href="/home" className="font-headline font-bold text-xl tracking-tight" style={{ color: '#D6536D', fontFamily: "'Bricolage Grotesk', sans-serif" }}>
            PICKS
          </Link>
        )}
        {title && (
          <span className="text-[17px] font-semibold text-picks-dark">{title}</span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {rightElement}
        {showLogo && !showBack && (
          <Link href="/notifications" className="relative p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-picks-red rounded-full" />
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
