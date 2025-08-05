CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "users" (
    "user_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "user_email" varchar UNIQUE,
    "username" varchar,
    "first_name" varchar,
    "last_name" varchar,
    "time_account_created" timestamp,
    "roles" varchar[],
    "last_sign_in" timestamp
);