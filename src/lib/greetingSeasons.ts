export type GreetingSeason = {
  id: string;
  name: string;
  emoji: string;
  date: string; // YYYY-MM-DD (안부 보내기 기준일)
  windowDays: number; // 기준일 몇 일 전부터 배너 표시
  gradient: string;
  tip: string; // 안부 문구 힌트
};

// 음력 기반 명절 (연도별 양력 날짜)
const LUNAR_SEASONS: Record<number, { seollal: string; chuseok: string }> = {
  2024: { seollal: '2024-02-10', chuseok: '2024-09-17' },
  2025: { seollal: '2025-01-29', chuseok: '2025-10-06' },
  2026: { seollal: '2026-02-17', chuseok: '2026-09-25' },
  2027: { seollal: '2027-02-07', chuseok: '2027-09-15' },
  2028: { seollal: '2028-01-27', chuseok: '2028-10-03' },
};

function buildSeasons(year: number): GreetingSeason[] {
  const lunar = LUNAR_SEASONS[year] ?? LUNAR_SEASONS[2025];

  const fixed: GreetingSeason[] = [
    {
      id: `newyear-${year}`,
      name: '신정',
      emoji: '🎉',
      date: `${year}-01-01`,
      windowDays: 7,
      gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      tip: '새해 첫날, 소중한 분들께 새해 인사를 전해보세요',
    },
    {
      id: `valentine-${year}`,
      name: '발렌타인데이',
      emoji: '🍫',
      date: `${year}-02-14`,
      windowDays: 7,
      gradient: 'linear-gradient(135deg, #D6536D 0%, #a83251 100%)',
      tip: '마음을 전하기 좋은 날이에요',
    },
    {
      id: `white-${year}`,
      name: '화이트데이',
      emoji: '🤍',
      date: `${year}-03-14`,
      windowDays: 7,
      gradient: 'linear-gradient(135deg, #f8a5c2 0%, #D6536D 100%)',
      tip: '사탕처럼 달콤한 안부를 전해보세요',
    },
    {
      id: `parents-${year}`,
      name: '어버이날',
      emoji: '🌹',
      date: `${year}-05-08`,
      windowDays: 10,
      gradient: 'linear-gradient(135deg, #E43D12 0%, #c0392b 100%)',
      tip: '부모님께 감사한 마음을 전달해보세요',
    },
    {
      id: `children-${year}`,
      name: '어린이날',
      emoji: '🎈',
      date: `${year}-05-05`,
      windowDays: 7,
      gradient: 'linear-gradient(135deg, #EFB11D 0%, #e67e22 100%)',
      tip: '아이들과 함께하는 분들께 인사를 보내보세요',
    },
    {
      id: `teacher-${year}`,
      name: '스승의날',
      emoji: '📚',
      date: `${year}-05-15`,
      windowDays: 7,
      gradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
      tip: '은사님께 감사 인사를 전해보세요',
    },
    {
      id: `pepero-${year}`,
      name: '빼빼로데이',
      emoji: '🍫',
      date: `${year}-11-11`,
      windowDays: 7,
      gradient: 'linear-gradient(135deg, #8e44ad 0%, #6a1a8a 100%)',
      tip: '가까운 분들께 달콤한 안부 메시지를 보내보세요',
    },
    {
      id: `christmas-${year}`,
      name: '크리스마스',
      emoji: '🎄',
      date: `${year}-12-25`,
      windowDays: 14,
      gradient: 'linear-gradient(135deg, #E43D12 0%, #27ae60 100%)',
      tip: '연말에 소중한 분들께 따뜻한 인사를 전해보세요',
    },
    {
      id: `yearend-${year}`,
      name: '연말',
      emoji: '🥂',
      date: `${year}-12-31`,
      windowDays: 7,
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      tip: '한 해를 마무리하며 안부 인사를 보내보세요',
    },
  ];

  const lunarSeasons: GreetingSeason[] = [
    {
      id: `seollal-${year}`,
      name: '설날',
      emoji: '🧧',
      date: lunar.seollal,
      windowDays: 14,
      gradient: 'linear-gradient(135deg, #E43D12 0%, #c0392b 100%)',
      tip: '설날 연휴, 가족·친구·지인들께 새해 덕담을 전해보세요',
    },
    {
      id: `chuseok-${year}`,
      name: '추석',
      emoji: '🌕',
      date: lunar.chuseok,
      windowDays: 14,
      gradient: 'linear-gradient(135deg, #EFB11D 0%, #e67e22 100%)',
      tip: '추석 연휴, 그리운 분들께 풍성한 안부를 전해보세요',
    },
  ];

  return [...fixed, ...lunarSeasons];
}

/**
 * 오늘 기준으로 windowDays 이내에 다가오는 안부 시즌 목록 반환
 * (지난 날짜 제외, 최대 당일까지)
 */
export function getUpcomingGreetingSeasons(today: Date): GreetingSeason[] {
  const year = today.getFullYear();
  const seasons = [...buildSeasons(year), ...buildSeasons(year + 1)];

  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return seasons
    .filter((s) => {
      const dateMs = new Date(s.date).getTime();
      const diffDays = Math.ceil((dateMs - todayMs) / 86400000);
      return diffDays >= 0 && diffDays <= s.windowDays;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * D-day 라벨 반환
 */
export function getDdayLabel(dateStr: string, today: Date): string {
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dateMs = new Date(dateStr).getTime();
  const diff = Math.ceil((dateMs - todayMs) / 86400000);
  if (diff === 0) return 'D-Day 🎉';
  return `D-${diff}`;
}
