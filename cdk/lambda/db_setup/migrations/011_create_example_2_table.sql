CREATE TABLE IF NOT EXISTS "example_2" (
    "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "name" varchar(255) NOT NULL,
    "description" text,
    "status" varchar(50) DEFAULT 'active',
    "count" integer DEFAULT 0,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);