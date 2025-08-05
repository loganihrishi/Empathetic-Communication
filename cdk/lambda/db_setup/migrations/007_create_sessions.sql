CREATE TABLE IF NOT EXISTS "sessions" (
    "session_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "student_interaction_id" uuid,
    "session_name" varchar,
    "session_context_embeddings" float[],
    "last_accessed" timestamp,
    "notes" text
);

ALTER TABLE "sessions" ADD FOREIGN KEY ("student_interaction_id") REFERENCES "student_interactions" ("student_interaction_id") ON DELETE CASCADE ON UPDATE CASCADE;