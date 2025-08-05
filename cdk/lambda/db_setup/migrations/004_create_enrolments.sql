CREATE TABLE IF NOT EXISTS "enrolments" (
    "enrolment_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "user_id" uuid,
    "simulation_group_id" uuid,
    "enrolment_type" varchar,
    "group_completion_percentage" integer,
    "time_enroled" timestamp
);

ALTER TABLE "enrolments" ADD FOREIGN KEY ("simulation_group_id") REFERENCES "simulation_groups" ("simulation_group_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrolments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_simulation_group_user'
        AND conrelid = '"enrolments"'::regclass
    ) THEN
        ALTER TABLE "enrolments" ADD CONSTRAINT unique_simulation_group_user UNIQUE (simulation_group_id, user_id);
    END IF;
END $$;