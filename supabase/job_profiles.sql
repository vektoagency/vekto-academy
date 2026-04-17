-- ═══════════════════════════════════════════════════════
-- Job pipeline profiles — run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS job_profiles (
  user_id TEXT PRIMARY KEY,
  specialty TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  portfolio_url TEXT NOT NULL DEFAULT '',
  social_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft', -- draft | submitted | reviewed | accepted | rejected
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_profiles ENABLE ROW LEVEL SECURITY;
-- service_role bypasses RLS; user reads/writes go through API routes with admin key.
