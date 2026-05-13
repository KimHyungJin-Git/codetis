-- profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  nickname TEXT,
  phone TEXT,
  birthday DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- connections (관계 연락처)
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  birthday DATE,
  category TEXT NOT NULL DEFAULT '친구',
  memo TEXT,
  last_contact DATE,
  avatar_color TEXT DEFAULT '#D6536D',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_categories (사용자 정의 카테고리)
CREATE TABLE IF NOT EXISTS user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- calendar_events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  color TEXT DEFAULT '#D6536D',
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- message_templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- message_send_logs
CREATE TABLE IF NOT EXISTS message_send_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_content TEXT,
  sent_to JSONB DEFAULT '[]',
  failed JSONB DEFAULT '[]',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  birthday_enabled BOOLEAN DEFAULT TRUE,
  newyear_enabled BOOLEAN DEFAULT TRUE,
  nocontact_enabled BOOLEAN DEFAULT TRUE,
  season_enabled BOOLEAN DEFAULT TRUE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_send_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (each user can only see/edit their own data)
CREATE POLICY "profiles_self" ON profiles USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "connections_self" ON connections USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_self" ON user_categories USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_self" ON calendar_events USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "templates_self" ON message_templates USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_self" ON message_send_logs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_self" ON notification_settings USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));

  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id);

  -- Insert default message templates
  INSERT INTO message_templates (user_id, category, content) VALUES
  (NEW.id, '기본 안부', '안녕하세요! 잘 지내고 계신가요? 😊'),
  (NEW.id, '기본 안부', '오랜만이에요! 요즘 어떻게 지내세요?'),
  (NEW.id, '친한 친구용', '야 오랜만이다! 밥 한번 먹자ㅋㅋ'),
  (NEW.id, '친한 친구용', '어이~ 살아있어? 연락 좀 해라!'),
  (NEW.id, '어색 관계용', '안녕하세요. 잘 지내고 계신가요? 오랜만에 연락드립니다.'),
  (NEW.id, '대학생용', 'ㅎㅇ! 요즘 학교 어때? 과제는?');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
