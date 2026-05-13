-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_tags" (
    "activity_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "activity_tags_pkey" PRIMARY KEY ("activity_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_tags" ADD CONSTRAINT "activity_tags_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_tags" ADD CONSTRAINT "activity_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
