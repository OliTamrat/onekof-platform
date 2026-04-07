-- CreateTable
CREATE TABLE "public"."wiki_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'BookOpen',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wiki_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wiki_articles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wiki_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wiki_categories_organization_id_slug_key" ON "public"."wiki_categories"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "wiki_categories_organization_id_idx" ON "public"."wiki_categories"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_articles_organization_id_slug_key" ON "public"."wiki_articles"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "wiki_articles_organization_id_status_idx" ON "public"."wiki_articles"("organization_id", "status");

-- CreateIndex
CREATE INDEX "wiki_articles_category_id_idx" ON "public"."wiki_articles"("category_id");

-- CreateIndex
CREATE INDEX "wiki_articles_created_by_idx" ON "public"."wiki_articles"("created_by");

-- AddForeignKey
ALTER TABLE "public"."wiki_articles" ADD CONSTRAINT "wiki_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."wiki_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
