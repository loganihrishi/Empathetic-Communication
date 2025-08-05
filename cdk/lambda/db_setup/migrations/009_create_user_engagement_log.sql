CREATE TABLE IF NOT EXISTS "user_engagement_log" (
    "log_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "user_id" uuid,
    "simulation_group_id" uuid,
    "patient_id" uuid,
    "enrolment_id" uuid,
    "timestamp" timestamp,
    "engagement_type" varchar,
    "engagement_details" text
);

ALTER TABLE "user_engagement_log" ADD FOREIGN KEY ("enrolment_id") REFERENCES "enrolments" ("enrolment_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_engagement_log" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_engagement_log" ADD FOREIGN KEY ("simulation_group_id") REFERENCES "simulation_groups" ("simulation_group_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_engagement_log" ADD FOREIGN KEY ("patient_id") REFERENCES "patients" ("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;