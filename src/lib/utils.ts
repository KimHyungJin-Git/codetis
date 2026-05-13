export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const bday = new Date(birthday);
  const nextBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (nextBday < today) {
    nextBday.setFullYear(today.getFullYear() + 1);
  }
  const diff = nextBday.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDaysSinceContact(lastContact: string): number {
  const today = new Date();
  const last = new Date(lastContact);
  const diff = today.getTime() - last.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatBirthday(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function getInitial(name: string): string {
  return name.charAt(0);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): {
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
} {
  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const typeCount = [hasUpper, hasLower, hasNumber].filter(Boolean).length;
  return {
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid: hasLength && typeCount >= 2,
  };
}

export function getDaysAgo(dateStr: string): string {
  const days = getDaysSinceContact(dateStr);
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  return `${days}일 전`;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('picks_auth') === 'true';
}

export function setLoggedIn(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem('picks_auth', 'true');
  } else {
    localStorage.removeItem('picks_auth');
  }
}

export function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export function padZero(n: number): string {
  return n.toString().padStart(2, '0');
}
