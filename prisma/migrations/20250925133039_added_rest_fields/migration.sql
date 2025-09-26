-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
