// 고정 공휴일 (음력 변환 불필요한 것들)
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '크리스마스',
};

// 음력 기반 공휴일 (연도별 양력 날짜)
const LUNAR_HOLIDAYS: Record<number, Record<string, string>> = {
  2024: {
    '02-09': '설날 전날',
    '02-10': '설날',
    '02-11': '설날 다음날',
    '02-12': '설날 대체공휴일',
    '05-15': '부처님오신날',
    '09-16': '추석 전날',
    '09-17': '추석',
    '09-18': '추석 다음날',
  },
  2025: {
    '01-28': '설날 전날',
    '01-29': '설날',
    '01-30': '설날 다음날',
    '05-05': '부처님오신날', // 어린이날과 겹침
    '05-06': '부처님오신날 대체공휴일',
    '10-05': '추석 전날',
    '10-06': '추석',
    '10-07': '추석 다음날',
    '10-08': '추석 대체공휴일',
  },
  2026: {
    '02-16': '설날 전날',
    '02-17': '설날',
    '02-18': '설날 다음날',
    '05-24': '부처님오신날',
    '09-24': '추석 전날',
    '09-25': '추석',
    '09-26': '추석 다음날',
  },
  2027: {
    '02-06': '설날 전날',
    '02-07': '설날',
    '02-08': '설날 다음날',
    '05-13': '부처님오신날',
    '09-14': '추석 전날',
    '09-15': '추석',
    '09-16': '추석 다음날',
  },
  2028: {
    '01-26': '설날 전날',
    '01-27': '설날',
    '01-28': '설날 다음날',
    '05-02': '부처님오신날',
    '10-02': '추석 전날',
    '10-03': '추석',
    '10-04': '추석 다음날',
  },
};

/**
 * 해당 연도의 공휴일 맵을 반환
 * key: 'YYYY-MM-DD', value: 공휴일 이름
 */
export function getKoreanHolidays(year: number): Record<string, string> {
  const result: Record<string, string> = {};

  // 고정 공휴일
  for (const [mmdd, name] of Object.entries(FIXED_HOLIDAYS)) {
    result[`${year}-${mmdd}`] = name;
  }

  // 음력 기반 공휴일
  const lunar = LUNAR_HOLIDAYS[year] ?? {};
  for (const [mmdd, name] of Object.entries(lunar)) {
    const key = `${year}-${mmdd}`;
    // 이미 고정 공휴일이 있으면 같이 표시
    if (result[key]) {
      result[key] = `${result[key]} · ${name}`;
    } else {
      result[key] = name;
    }
  }

  return result;
}

/**
 * 특정 날짜가 공휴일인지 확인
 */
export function getHolidayName(dateStr: string): string | null {
  const year = parseInt(dateStr.slice(0, 4));
  const holidays = getKoreanHolidays(year);
  return holidays[dateStr] ?? null;
}
