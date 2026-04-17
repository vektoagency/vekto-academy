-- ═══════════════════════════════════════════════════════
-- Arena submissions — student uploads videos for challenges,
-- admin marks the winner per challenge.
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS arena_submissions (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  bunny_video_id TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted | reviewed | winner | rejected
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_arena_submissions_challenge ON arena_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_arena_submissions_user ON arena_submissions(user_id);

ALTER TABLE arena_submissions ENABLE ROW LEVEL SECURITY;

-- Add winner_user_id + winner_submission_id to challenges (for fast lookup)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS winner_submission_id BIGINT REFERENCES arena_submissions(id) ON DELETE SET NULL;
