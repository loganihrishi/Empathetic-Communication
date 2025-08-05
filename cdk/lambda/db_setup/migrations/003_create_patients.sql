CREATE TABLE IF NOT EXISTS "patients" (
    "patient_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "simulation_group_id" uuid,
    "patient_name" varchar,
    "patient_age" integer,
    "patient_gender" varchar,
    "patient_number" integer,
    "patient_prompt" text,
    "llm_completion" BOOLEAN DEFAULT TRUE,
    "voice_id" varchar DEFAULT 'tiffany'
);

ALTER TABLE "patients" ADD FOREIGN KEY ("simulation_group_id") REFERENCES "simulation_groups" ("simulation_group_id") ON DELETE CASCADE ON UPDATE CASCADE;