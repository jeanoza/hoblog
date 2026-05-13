-- Drop foreign key and unique index that include user_id
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_user_id_fkey";
DROP INDEX IF EXISTS "tags_user_id_name_key";

-- Drop user_id column
ALTER TABLE "tags" DROP COLUMN IF EXISTS "user_id";

-- Add unique constraint on name alone
ALTER TABLE "tags" ADD CONSTRAINT "tags_name_key" UNIQUE ("name");
