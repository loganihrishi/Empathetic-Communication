CREATE TABLE IF NOT EXISTS "patient_data" (
    "file_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "patient_id" uuid,
    "filetype" varchar,
    "s3_bucket_reference" varchar,
    "filepath" varchar,
    "filename" varchar,
    "time_uploaded" timestamp,
    "metadata" text,
    "file_number" integer,
    "ingestion_status" VARCHAR(20) DEFAULT 'not processing'
);

ALTER TABLE "patient_data" ADD FOREIGN KEY ("patient_id") REFERENCES "patients" ("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;