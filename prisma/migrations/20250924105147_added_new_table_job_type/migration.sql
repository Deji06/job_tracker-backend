/*
  Warnings:

  - Added the required column `jobType` to the `JobDescription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('HYBRID', 'FULL_TIME', 'REMOTE', 'CONTRACT', 'INTERN', 'ENTRY_LEVEL');

-- AlterTable
ALTER TABLE "public"."JobDescription" ADD COLUMN     "jobType" "public"."JobType" NOT NULL;
