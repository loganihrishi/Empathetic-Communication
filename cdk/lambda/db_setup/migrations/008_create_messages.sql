CREATE TABLE IF NOT EXISTS "messages" (
    "message_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "session_id" uuid,
    "student_sent" bool,
    "message_content" varchar,
    "time_sent" timestamp,
    "empathy_evaluation" JSONB DEFAULT '{}'::JSONB
);

ALTER TABLE "messages" ADD FOREIGN KEY ("session_id") REFERENCES "sessions" ("session_id") ON DELETE CASCADE ON UPDATE CASCADE;