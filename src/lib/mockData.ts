export interface Connection {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  category: string;
  memo: string;
  lastContact: string;
  avatar: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  memo: string;
}

export interface Notification {
  id: string;
  type: 'birthday' | 'newyear' | 'nocontact' | 'season' | 'reminder';
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface MessageTemplate {
  id: string;
  category: string;
  content: string;
}

export const mockConnections: Connection[] = [
  {
    id: '1',
    name: '김민준',
    phone: '010-1234-5678',
    birthday: '1995-03-15',
    category: '친구',
    memo: '대학교 동기, 좋아하는 음식은 스시',
    lastContact: '2026-04-20',
    avatar: '#D6536D',
  },
  {
    id: '2',
    name: '이서연',
    phone: '010-2345-6789',
    birthday: '1993-05-22',
    category: '가족',
    memo: '사촌 언니, 서울 거주',
    lastContact: '2026-05-01',
    avatar: '#EFB11D',
  },
  {
    id: '3',
    name: '박준혁',
    phone: '010-3456-7890',
    birthday: '1990-11-08',
    category: '비즈니스',
    memo: '마케팅 팀장, 골프 좋아함',
    lastContact: '2026-03-15',
    avatar: '#E43D12',
  },
  {
    id: '4',
    name: '최지아',
    phone: '010-4567-8901',
    birthday: '1998-07-30',
    category: '친구',
    memo: '고등학교 친구, 현재 부산 거주',
    lastContact: '2026-02-14',
    avatar: '#FFA2B6',
  },
  {
    id: '5',
    name: '정도현',
    phone: '010-5678-9012',
    birthday: '1992-01-05',
    category: '비즈니스',
    memo: '거래처 담당자, 꼼꼼한 성격',
    lastContact: '2026-04-05',
    avatar: '#4CAF50',
  },
];

export const mockTemplates: Record<string, string[]> = {
  '기본 안부': [
    '안녕하세요! 잘 지내고 계신가요? 😊',
    '오랜만이에요! 요즘 어떻게 지내세요?',
    '안녕! 잘 있어? 연락하고 싶었어~',
  ],
  '친한 친구용': [
    '야 오랜만이다! 밥 한번 먹자ㅋㅋ',
    '어이~ 살아있어? 연락 좀 해라!',
    '친구야~ 요즘 뭐해? 보고싶다!',
  ],
  '어색 관계용': [
    '안녕하세요. 잘 지내고 계신가요? 오랜만에 연락드립니다.',
    '안녕하세요! 연락이 뜸했는데 잘 지내셨으면 좋겠습니다.',
  ],
  '대학생용': [
    'ㅎㅇ! 요즘 학교 어때? 과제는?',
    '오랜만이야~ 시험 잘 봤어?',
    '야 방학에 뭐해? 한번 보자!',
  ],
};

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '김민준 생일',
    date: '2026-05-15',
    color: '#D6536D',
    memo: '카페 선물 준비',
  },
  {
    id: '2',
    title: '이서연 결혼기념일',
    date: '2026-05-22',
    color: '#EFB11D',
    memo: '축하 문자 보내기',
  },
  {
    id: '3',
    title: '박준혁 미팅',
    date: '2026-05-20',
    color: '#E43D12',
    memo: '오후 3시 강남역 카페',
  },
  {
    id: '4',
    title: '최지아 연락하기',
    date: '2026-05-13',
    color: '#FFA2B6',
    memo: '부산 여행 계획 물어보기',
  },
  {
    id: '5',
    title: '정도현 계약 만료',
    date: '2026-05-28',
    color: '#4CAF50',
    memo: '갱신 여부 확인 필요',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'birthday',
    title: '김민준 님의 생일이 2일 후입니다!',
    body: '소중한 관계를 놓치지 마세요. 생일 메시지를 보내보세요.',
    date: '2026-05-13T09:00:00',
    read: false,
  },
  {
    id: '2',
    type: 'nocontact',
    title: '최지아 님과 연락한 지 88일이 지났어요',
    body: '오랫동안 연락이 없었던 친구에게 안부를 전해보세요.',
    date: '2026-05-12T10:30:00',
    read: false,
  },
  {
    id: '3',
    type: 'season',
    title: '어버이날이 다가오고 있어요!',
    body: '가족에게 감사한 마음을 전해보세요. PICKS가 도와드릴게요.',
    date: '2026-05-10T08:00:00',
    read: true,
  },
  {
    id: '4',
    type: 'reminder',
    title: '박준혁 님께 메시지를 아직 보내지 않으셨어요',
    body: '지난주에 계획한 연락을 완료해보세요.',
    date: '2026-05-09T15:00:00',
    read: true,
  },
  {
    id: '5',
    type: 'birthday',
    title: '이서연 님의 생일이 9일 후입니다!',
    body: '가족에게 따뜻한 생일 메시지를 미리 준비해보세요.',
    date: '2026-05-08T09:00:00',
    read: true,
  },
  {
    id: '6',
    type: 'newyear',
    title: '신년 안부 메시지를 보내보세요',
    body: '새해를 맞아 소중한 관계에게 인사를 전해보세요.',
    date: '2026-01-01T09:00:00',
    read: true,
  },
];

export const mockMessageTemplateList: MessageTemplate[] = [
  { id: '1', category: '기본 안부', content: '안녕하세요! 잘 지내고 계신가요? 😊' },
  { id: '2', category: '기본 안부', content: '오랜만이에요! 요즘 어떻게 지내세요?' },
  { id: '3', category: '친한 친구용', content: '야 오랜만이다! 밥 한번 먹자ㅋㅋ' },
  { id: '4', category: '친한 친구용', content: '어이~ 살아있어? 연락 좀 해라!' },
  { id: '5', category: '어색 관계용', content: '안녕하세요. 잘 지내고 계신가요? 오랜만에 연락드립니다.' },
  { id: '6', category: '대학생용', content: 'ㅎㅇ! 요즘 학교 어때? 과제는?' },
];

export const mockImportContacts = [
  { id: 'i1', name: '강하늘', phone: '010-9876-5432' },
  { id: 'i2', name: '오지현', phone: '010-8765-4321' },
  { id: 'i3', name: '황민석', phone: '010-7654-3210' },
  { id: 'i4', name: '송채원', phone: '010-6543-2109' },
  { id: 'i5', name: '임재현', phone: '010-5432-1098' },
  { id: 'i6', name: '나은혜', phone: '010-4321-0987' },
  { id: 'i7', name: '조성훈', phone: '010-3210-9876' },
];

export const categories = ['전체', '친구', '가족', '비즈니스'];
