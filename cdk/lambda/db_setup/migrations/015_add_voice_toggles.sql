-- Add voice toggle columns to simulation_groups table
ALTER TABLE "simulation_groups" 
ADD COLUMN IF NOT EXISTS "admin_voice_enabled" BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS "instructor_voice_enabled" BOOLEAN DEFAULT TRUE;

-- Update existing records to have voice enabled by default
UPDATE "simulation_groups" 
SET "admin_voice_enabled" = TRUE, "instructor_voice_enabled" = TRUE 
WHERE "admin_voice_enabled" IS NULL OR "instructor_voice_enabled" IS NULL;