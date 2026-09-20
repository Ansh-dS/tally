-- AlterTable: Make password optional for Google OAuth users
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
