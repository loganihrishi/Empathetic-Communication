CREATE TABLE IF NOT EXISTS "student_interactions" (
    "student_interaction_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "patient_id" uuid,
    "enrolment_id" uuid,
    "patient_score" integer,
    "last_accessed" timestamp,
    "patient_context_embedding" float[],
    "is_completed" BOOLEAN DEFAULT FALSE
);

ALTER TABLE "student_interactions" ADD FOREIGN KEY ("patient_id") REFERENCES "patients" ("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_interactions" ADD FOREIGN KEY ("enrolment_id") REFERENCES "enrolments" ("enrolment_id") ON DELETE CASCADE ON UPDATE CASCADE;