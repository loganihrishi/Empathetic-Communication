# How to Add a New Table to the Database

This guide explains how to add a new table to the database using our node-pg-migrate system.

## Adding a New Migration

To add new tables/columns or alter existing ones, create a new SQL file in the migrations folder:

### Step 1: Create a New Migration File

Create a new `.sql` file in `cdk/lambda/db_setup/migrations/` with the next sequential number:

```
011_create_analytics_table.sql
```

### Step 2: Write Your SQL

```sql
CREATE TABLE IF NOT EXISTS "analytics" (
    "analytics_id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
    "user_id" uuid,
    "page_viewed" varchar,
    "time_spent" integer,
    "recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "analytics" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
```

That's it! The migration runs automatically during deployment.

## How It Works

- **node-pg-migrate** reads SQL files from `migrations/` folder
- Files are executed in alphabetical order (001, 002, 003...)
- Applied migrations are tracked in `schema_migrations` table
- Each migration runs only once
- System works for both new and existing deployments

## Best Practices

- **Sequential numbering**: Use 001, 002, 003... format
- **Descriptive names**: `011_add_user_preferences_table.sql`
- **Idempotent SQL**: Use `IF NOT EXISTS` and `DO $$` blocks
- **Separate concerns**: One logical change per migration file
- **Foreign keys**: Add them after table creation

## Column Additions Example

```sql
-- 012_add_user_timezone.sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='timezone'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "timezone" varchar DEFAULT 'UTC';
    END IF;
END $$;
```
