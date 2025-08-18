CREATE TABLE IF NOT EXISTS "system_prompt_history" (
    "history_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "simulation_group_id" uuid REFERENCES "simulation_groups"("simulation_group_id") ON DELETE CASCADE,
    "prompt_content" text NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "created_by" varchar,
    "is_active" bool DEFAULT false
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS "idx_system_prompt_history_group_id" ON "system_prompt_history"("simulation_group_id");
CREATE INDEX IF NOT EXISTS "idx_system_prompt_history_active" ON "system_prompt_history"("simulation_group_id", "is_active");