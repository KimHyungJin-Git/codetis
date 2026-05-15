export type SeasonKey =
  | 'newyear'
  | 'seollal'
  | 'spring'
  | 'may'
  | 'summer'
  | 'chuseok'
  | 'suneung'
  | 'christmas'
  | 'yearend'
  | 'general';

export interface SeasonInfo {
  key: SeasonKey;
  label: string;
  emoji: string;
  color: string;
}

export function getCurrentSeason(): SeasonInfo {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month === 1 && day <= 5)
    return { key: 'newyear', label: '새해', emoji: '🎊', color: '#D6536D' };
  if (month === 1 || month === 2)
    return { key: 'seollal', label: '설 명절', emoji: '🎎', color: '#EFB11D' };
  if (month === 3 || month === 4)
    return { key: 'spring', label: '봄', emoji: '🌸', color: '#E43D12' };
  if (month === 5)
    return { key: 'may', label: '가정의 달', emoji: '🌹', color: '#D6536D' };
  if (month >= 6 && month <= 8)
    return { key: 'summer', label: '여름', emoji: '☀️', color: '#EFB11D' };
  if (month === 9 || month === 10)
    return { key: 'chuseok', label: '추석 시즌', emoji: '🌕', color: '#EFB11D' };
  if (month === 11)
    return { key: 'suneung', label: '수능 시즌', emoji: '📚', color: '#2196F3' };
  if (month === 12 && day >= 20 && day <= 26)
    return { key: 'christmas', label: '크리스마스', emoji: '🎄', color: '#4CAF50' };
  if (month === 12)
    return { key: 'yearend', label: '연말', emoji: '🥂', color: '#9C27B0' };
  return { key: 'general', label: '일반', emoji: '💬', color: '#D6536D' };
}

export interface TemplateSuggestion {
  category: string;
  label: string;
  content: string;
}

export const SEASON_TEMPLATES: Record<SeasonKey, TemplateSuggestion[]> = {
  newyear: [
    {
      category: '새해 인사',
      label: '기본',
      content: '새해 복 많이 받으세요! 올 한 해도 건강하고 행복한 일들만 가득하길 바랍니다 🎊',
    },
    {
      category: '새해 인사',
      label: '친근',
      content: '새해 첫날부터 생각났어! 올해도 잘 부탁해 😊 건강하게 지내고 자주 보자~',
    },
    {
      category: '새해 인사',
      label: '비즈니스',
      content: '새해 복 많이 받으십시오. 올해도 좋은 인연 이어가길 바랍니다. 항상 감사드립니다.',
    },
  ],
  seollal: [
    {
      category: '설 인사',
      label: '기본',
      content: '설날 연휴 잘 보내고 계신가요? 새해에도 건강하시고 좋은 일들 가득하시길 바랍니다 🎎',
    },
    {
      category: '설 인사',
      label: '친근',
      content: '설 연휴 잘 지내? 오랜만에 연락해봤어. 고향 내려갔어? 명절 잘 보내고 밥 한번 먹자~',
    },
    {
      category: '설 인사',
      label: '비즈니스',
      content: '설 명절 잘 보내고 계십니까. 가족 모두 건강하시길 바랍니다. 새해에도 좋은 관계 부탁드립니다.',
    },
  ],
  spring: [
    {
      category: '봄 안부',
      label: '기본',
      content: '벚꽃이 피는 계절이 왔네요 🌸 요즘 어떻게 지내세요? 오랜만에 안부 전합니다.',
    },
    {
      category: '봄 안부',
      label: '친근',
      content: '날씨가 너무 좋다~ 봄이 오니까 괜히 연락하고 싶어졌어. 요즘 잘 지내? 밥 한번 먹자!',
    },
    {
      category: '봄 안부',
      label: '가족',
      content: '날이 따뜻해졌네요. 건강하게 잘 지내고 계시죠? 꽃구경 한 번 같이 가요 🌷',
    },
  ],
  may: [
    {
      category: '가정의 달',
      label: '어버이날',
      content: '어버이날을 맞아 감사한 마음 전합니다 🌹 항상 건강하시고 행복하세요. 사랑합니다.',
    },
    {
      category: '가정의 달',
      label: '스승의날',
      content: '스승의 날을 맞아 감사드립니다. 선생님 덕분에 많이 배우고 성장했습니다. 항상 건강하세요 🌷',
    },
    {
      category: '가정의 달',
      label: '일반',
      content: '5월 가정의 달이에요 🌹 소중한 분들 생각이 나서 연락드렸어요. 잘 지내고 계시죠?',
    },
  ],
  summer: [
    {
      category: '여름 안부',
      label: '기본',
      content: '무더운 날씨에 건강 잘 챙기고 계시나요 ☀️ 오랜만에 안부 여쭤봅니다. 시원하게 지내세요!',
    },
    {
      category: '여름 안부',
      label: '친근',
      content: '더워 죽겠다ㅋㅋ 요즘 어떻게 지내? 날씨 때문에 생각나서 연락해봤어~ 시원한 거 먹으러 가자!',
    },
    {
      category: '여름 안부',
      label: '휴가',
      content: '여름 휴가 계획 있어요? 더운 날씨지만 활기차게 보내고 계시죠? 좋은 여름 되세요 🏖️',
    },
  ],
  chuseok: [
    {
      category: '추석 인사',
      label: '기본',
      content: '추석 연휴 잘 보내고 계시죠? 풍성한 한가위 되시길 바랍니다 🌕 항상 건강하세요.',
    },
    {
      category: '추석 인사',
      label: '친근',
      content: '명절 잘 보내고 있어? 고향 내려갔어? 오랜만에 생각나서 연락해봤어 🌕 명절 끝나고 한번 보자~',
    },
    {
      category: '추석 인사',
      label: '비즈니스',
      content: '한가위 즐겁고 풍성하게 보내시길 바랍니다. 가족 모두 건강하시길 바랍니다. 감사드립니다 🌕',
    },
  ],
  suneung: [
    {
      category: '수능 응원',
      label: '수험생',
      content: '수능 잘 봐! 지금까지 열심히 한 거 다 나올 거야. 긴장하지 말고 평소처럼만 해 💪 응원해!',
    },
    {
      category: '수능 응원',
      label: '수험생 가족',
      content: '수능 준비로 많이 고생하셨겠네요. 자녀분 꼭 좋은 결과 있기를 응원합니다 📚',
    },
    {
      category: '11월 안부',
      label: '일반',
      content: '11월도 벌써 왔네요. 요즘 어떻게 지내세요? 날씨가 쌀쌀해졌는데 건강 잘 챙기세요 🍂',
    },
  ],
  christmas: [
    {
      category: '크리스마스',
      label: '기본',
      content: '메리 크리스마스! 🎄 따뜻하고 행복한 연말 보내고 계시죠? 좋은 하루 되세요!',
    },
    {
      category: '크리스마스',
      label: '친근',
      content: '메리 크리스마스~🎅 올 한 해도 잘 부탁했어! 따뜻하게 보내고 새해에 보자',
    },
    {
      category: '크리스마스',
      label: '비즈니스',
      content: '즐거운 성탄절 보내시길 바랍니다 🎄 올 한 해도 함께해 주셔서 감사합니다.',
    },
  ],
  yearend: [
    {
      category: '연말 인사',
      label: '기본',
      content: '한 해가 저물어가네요. 올 한 해도 고생 많으셨습니다. 따뜻한 연말 보내세요 🥂',
    },
    {
      category: '연말 인사',
      label: '친근',
      content: '올해도 다 가네~ 올 한 해 고생 많았어! 연말 잘 마무리하고 새해에 꼭 보자 🎉',
    },
    {
      category: '연말 인사',
      label: '비즈니스',
      content: '한 해 동안 함께해 주셔서 진심으로 감사드립니다. 뜻깊은 연말 보내시길 바랍니다.',
    },
  ],
  general: [
    {
      category: '기본 안부',
      label: '일반',
      content: '오랜만에 안부 전합니다. 요즘 어떻게 지내세요? 건강하게 잘 지내고 계시죠?',
    },
    {
      category: '기본 안부',
      label: '친근',
      content: '오랜만이야! 요즘 어떻게 지내? 생각나서 연락해봤어. 밥 한번 같이 먹자~',
    },
    {
      category: '기본 안부',
      label: '비즈니스',
      content: '안녕하세요, 오랜만에 연락드립니다. 잘 지내고 계시죠? 좋은 하루 되세요.',
    },
  ],
};

export interface GreetingSuggestion {
  label: string;
  content: string;
  reason: string;
}

export function getGreetingSuggestions(
  category: string,
  daysSinceContact: number | null,
  name: string,
): GreetingSuggestion[] {
  const suggestions: GreetingSuggestion[] = [];
  const season = getCurrentSeason();

  // 시즌 기반 추천
  const seasonMsgs = SEASON_TEMPLATES[season.key];
  if (seasonMsgs.length > 0) {
    const pick = seasonMsgs[0];
    suggestions.push({
      label: `${season.emoji} ${season.label}`,
      content: pick.content,
      reason: `${season.label} 시즌 안부`,
    });
  }

  // 관계 기반 추천
  if (category === '가족') {
    suggestions.push({
      label: '가족 안부',
      content: `${name}아/야, 잘 지내고 있어? 오랜만에 연락해봤어. 건강하게 지내고 있지? 밥은 잘 먹고 다니는 거야?`,
      reason: '가족 관계 맞춤',
    });
  } else if (category === '비즈니스') {
    suggestions.push({
      label: '비즈니스 안부',
      content: `안녕하세요, ${name}님. 잘 지내고 계시죠? 오랜만에 안부 여쭤봅니다. 좋은 하루 되세요.`,
      reason: '비즈니스 관계 맞춤',
    });
  } else {
    suggestions.push({
      label: '친구 안부',
      content: `야 ${name}! 오랜만이다ㅋㅋ 요즘 어떻게 지내? 갑자기 생각나서 연락해봤어. 밥 한번 먹자~`,
      reason: '친구 관계 맞춤',
    });
  }

  // 미연락 기간 기반 추천
  if (daysSinceContact !== null && daysSinceContact > 60) {
    suggestions.push({
      label: '오랜만 인사',
      content: `안녕하세요! 오랫동안 연락 못 드렸네요. 잘 지내고 계시죠? 시간 되면 한번 봐요 😊`,
      reason: `${daysSinceContact}일 만에 연락`,
    });
  }

  return suggestions.slice(0, 3);
}

export const RELATIONSHIP_TEMPLATE_SETS: { category: string; emoji: string; templates: TemplateSuggestion[] }[] = [
  {
    category: '친구',
    emoji: '👫',
    templates: [
      { category: '친한 친구', label: '안부', content: '야 오랜만이다! 요즘 어떻게 지내? 갑자기 생각나서 연락해봤어. 밥 한번 먹자~' },
      { category: '친한 친구', label: '생일', content: '생일 축하해🎂 올 한 해도 하고 싶은 것 다 하고, 좋은 일만 가득하길! 다음에 밥 한번 사줄게ㅎㅎ' },
      { category: '어색한 친구', label: '안부', content: '안녕~ 오랜만이야. 잘 지내고 있어? 별일 없지? 나는 잘 지내고 있어!' },
    ],
  },
  {
    category: '가족',
    emoji: '🏠',
    templates: [
      { category: '가족', label: '일반', content: '잘 지내? 밥은 잘 먹고 다니는 거야? 건강하게 지내고 있지? 조만간 얼굴 보자' },
      { category: '가족', label: '명절', content: '명절 잘 보내고 있어요? 건강하게 잘 지내고 계시죠? 빨리 얼굴 보고 싶어요 🙂' },
      { category: '가족', label: '감사', content: '항상 고마워요. 덕분에 잘 지내고 있어요. 건강하게 오래오래 계세요. 사랑합니다 ❤️' },
    ],
  },
  {
    category: '비즈니스',
    emoji: '💼',
    templates: [
      { category: '비즈니스', label: '안부', content: '안녕하세요. 오랜만에 연락드립니다. 잘 지내고 계시죠? 좋은 하루 되세요.' },
      { category: '비즈니스', label: '감사', content: '지난번에 도움 주셔서 정말 감사드립니다. 덕분에 잘 해결되었습니다. 다음에 식사라도 함께해요.' },
      { category: '비즈니스', label: '제안', content: '안녕하세요. 잠깐 통화 가능하실까요? 말씀드리고 싶은 게 있어서요. 편하신 시간에 연락 주세요.' },
    ],
  },
];
