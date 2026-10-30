/*
  # Create tickets table

  1. New Tables
    - `tickets` — stores task requests submitted by anyone

  2. Security
    - RLS enabled
    - Public: SELECT + INSERT (anyone can read and create tickets)
    - Public: UPDATE + DELETE (admin auth gate is in the UI via VITE_ADMIN_PASSWORD)

  3. Post-migration step
    - Enable Realtime on this table in Supabase Dashboard → Database → Replication
*/

CREATE TABLE IF NOT EXISTS tickets (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  description    text,
  creator_name   text        NOT NULL,
  status         text        NOT NULL DEFAULT 'todo'
                 CHECK (status IN ('todo', 'in_progress', 'done')),
  days_required  integer,
  queue_position integer,
  started_at     timestamptz,
  completed_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"   ON tickets FOR SELECT USING (true);
CREATE POLICY "Public insert" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON tickets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON tickets FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS tickets_status_idx         ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_queue_position_idx ON tickets (queue_position);
