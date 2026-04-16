-- ═══════════════════════════════════════════════════════
-- Course content tables — run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Modules
CREATE TABLE IF NOT EXISTS course_modules (
  id INT PRIMARY KEY,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

-- Lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id TEXT PRIMARY KEY,
  module_id INT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '0:00',
  bunny_id TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

-- RLS
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read course_modules" ON course_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can read course_lessons" ON course_lessons FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════
-- Seed data
-- ═══════════════════════════════════════════════════════

INSERT INTO course_modules (id, title, emoji, sort_order) VALUES
  (0, 'Старт', '🚀', 0),
  (1, 'Майндсет', '🧠', 1),
  (2, 'Психология и стратегия', '🎯', 2),
  (3, 'Инструментите', '🛠', 3),
  (4, 'The Playbooks', '⭐', 4),
  (5, 'Монтаж за задържане на внимание', '✂️', 5),
  (6, 'Машината за клиенти', '💰', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_lessons (id, module_id, title, duration, bunny_id, sort_order) VALUES
  ('0-1', 0, 'Как се ползва платформата', '3:00', '', 0),
  ('0-2', 0, 'Добре дошли в обучението', '5:12', 'dbc5a2c0-7b9e-48d4-a916-bfa313e9c9a8', 1),
  ('1-1', 1, 'Мисли като маркетолог, виждай като режисьор', '13:00', '', 0),
  ('1-2', 1, 'Пускай. Учи. Повтаряй.', '12:00', '', 1),
  ('2-1', 2, 'Hook / Body / CTA анатомия', '12:00', '', 0),
  ('2-2', 2, 'Голямата рамка — най-добрата рамка за платена реклама', '10:00', '', 1),
  ('2-3', 2, 'TOF MOF BOF', '11:00', '', 2),
  ('2-4', 2, 'Матрицата на ъглите — как генерираш 10 ъгъла за всеки продукт', '12:00', '', 3),
  ('2-5', 2, 'Органик vs Платено — различна логика, различни метрики', '10:00', '', 4),
  ('3-1', 3, 'Промптинг основи', '14:00', '', 0),
  ('3-2', 3, 'Инструментите — регистрация и setup', '10:00', '', 1),
  ('3-3', 3, 'Генериране на изображения', '18:00', '', 2),
  ('3-4', 3, 'От снимка към видео', '15:00', '', 3),
  ('3-5', 3, 'Глас и аудио', '12:00', '', 4),
  ('3-6', 3, 'HeyGen — аватари и дигитален близнак', '16:00', '', 5),
  ('3-7', 3, 'CapCut — workflow от А до Я', '20:00', '', 6),
  ('4-1', 4, 'AI UGC реклами — Онлайн магазини · TOF и BOF', '25:00', '', 0),
  ('4-2', 4, 'Faceless viral TikTok / Reels — без да се показваш', '25:00', '', 1),
  ('4-3', 4, 'Говорещи глави / VSL — Коучове и услуги', '25:00', '', 2),
  ('4-4', 4, 'Кинематографски / Brand Film — Луксозни брандове', '25:00', '', 3),
  ('4-5', 4, 'Органично съдържание', '20:00', '', 4),
  ('5-1', 5, 'Retention editing — смяна на кадър на всеки 3 секунди', '12:00', '', 0),
  ('5-2', 5, 'Субтитри които продават — Hormozi стил с 1 клик', '11:00', '', 1),
  ('5-3', 5, 'Sound design — swoosh · pop · riser ефекти', '12:00', '', 2),
  ('6-1', 6, 'Как намираш клиенти — фитнеси · зъболекари · локален бизнес', '13:00', '', 0),
  ('6-2', 6, 'Офертата — пакет от ъгли, не просто видеа', '12:00', '', 1)
ON CONFLICT (id) DO NOTHING;
