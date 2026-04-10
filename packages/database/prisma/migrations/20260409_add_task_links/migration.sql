-- CreateEnum
CREATE TYPE "public"."TaskLinkType" AS ENUM ('BLOCKS', 'IS_BLOCKED_BY', 'CLONES', 'IS_CLONED_BY', 'DUPLICATES', 'IS_DUPLICATED_BY', 'RELATES_TO', 'CAUSES', 'IS_CAUSED_BY');

-- CreateTable
CREATE TABLE "public"."task_links" (
    "id" TEXT NOT NULL,
    "from_task_id" TEXT NOT NULL,
    "to_task_id" TEXT NOT NULL,
    "type" "public"."TaskLinkType" NOT NULL DEFAULT 'RELATES_TO',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_links_from_task_id_to_task_id_type_key" ON "public"."task_links"("from_task_id", "to_task_id", "type");

-- CreateIndex
CREATE INDEX "task_links_from_task_id_idx" ON "public"."task_links"("from_task_id");

-- CreateIndex
CREATE INDEX "task_links_to_task_id_idx" ON "public"."task_links"("to_task_id");

-- AddForeignKey
ALTER TABLE "public"."task_links" ADD CONSTRAINT "task_links_from_task_id_fkey" FOREIGN KEY ("from_task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_links" ADD CONSTRAINT "task_links_to_task_id_fkey" FOREIGN KEY ("to_task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_links" ADD CONSTRAINT "task_links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
