export interface Profile {
  id: string;
  name: string;
  nickname?: string;
  phone?: string;
  birthday?: string;
  email?: string;
  updated_at?: string;
}

export interface Connection {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  birthday?: string;
  category: string;
  memo?: string;
  last_contact?: string;
  avatar_color: string;
  created_at?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  date: string;
  color: string;
  memo?: string;
  created_at?: string;
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  category: string;
  content: string;
  created_at?: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  birthday_enabled: boolean;
  newyear_enabled: boolean;
  nocontact_enabled: boolean;
  season_enabled: boolean;
  reminder_enabled: boolean;
}
