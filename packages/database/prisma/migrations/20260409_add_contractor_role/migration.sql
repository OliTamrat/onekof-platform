-- AlterEnum: Add CONTRACTOR to ProjectRole
ALTER TYPE "public"."ProjectRole" ADD VALUE IF NOT EXISTS 'CONTRACTOR';
