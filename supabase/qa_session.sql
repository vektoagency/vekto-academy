-- ═══════════════════════════════════════════════════════
-- Generic settings table — used for Q&A link and other small key/value pairs
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app_settings" ON app_settings FOR SELECT USING (true);

INSERT INTO app_settings (key, value) VALUES
  ('qa_session', '{"label": "Събота 18:00", "url": "", "next_at": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;
