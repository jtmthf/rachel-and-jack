import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_stack_direction" AS ENUM('vertical', 'horizontal');
  CREATE TYPE "public"."enum__pages_v_blocks_stack_direction" AS ENUM('vertical', 'horizontal');
  CREATE TABLE IF NOT EXISTS "pages_blocks_place" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"image_id" integer,
  	"description" jsonb,
  	"url" varchar,
  	"location" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"direction" "enum_pages_blocks_stack_direction" DEFAULT 'vertical',
  	"wrap" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_place" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"image_id" integer,
  	"description" jsonb,
  	"url" varchar,
  	"location" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"direction" "enum__pages_v_blocks_stack_direction" DEFAULT 'vertical',
  	"wrap" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "place_tag" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "place_tag_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "place_tag_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "place_tag_id" integer;
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_place" ADD CONSTRAINT "pages_blocks_place_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_place" ADD CONSTRAINT "pages_blocks_place_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_stack" ADD CONSTRAINT "pages_blocks_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_place" ADD CONSTRAINT "_pages_v_blocks_place_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_place" ADD CONSTRAINT "_pages_v_blocks_place_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_stack" ADD CONSTRAINT "_pages_v_blocks_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_place_order_idx" ON "pages_blocks_place" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_place_parent_id_idx" ON "pages_blocks_place" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_place_path_idx" ON "pages_blocks_place" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_place_image_idx" ON "pages_blocks_place" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_stack_order_idx" ON "pages_blocks_stack" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_stack_parent_id_idx" ON "pages_blocks_stack" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_stack_path_idx" ON "pages_blocks_stack" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_place_order_idx" ON "_pages_v_blocks_place" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_place_parent_id_idx" ON "_pages_v_blocks_place" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_place_path_idx" ON "_pages_v_blocks_place" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_place_image_idx" ON "_pages_v_blocks_place" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stack_order_idx" ON "_pages_v_blocks_stack" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stack_parent_id_idx" ON "_pages_v_blocks_stack" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stack_path_idx" ON "_pages_v_blocks_stack" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "place_tag_slug_idx" ON "place_tag" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "place_tag_updated_at_idx" ON "place_tag" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "place_tag_created_at_idx" ON "place_tag" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_place_tag_fk" FOREIGN KEY ("place_tag_id") REFERENCES "public"."place_tag"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_place_tag_fk" FOREIGN KEY ("place_tag_id") REFERENCES "public"."place_tag"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_place_tag_fk" FOREIGN KEY ("place_tag_id") REFERENCES "public"."place_tag"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_rels_place_tag_id_idx" ON "pages_rels" USING btree ("place_tag_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_place_tag_id_idx" ON "_pages_v_rels" USING btree ("place_tag_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_place_tag_id_idx" ON "payload_locked_documents_rels" USING btree ("place_tag_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_place" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stack" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_place" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stack" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "place_tag" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_place" CASCADE;
  DROP TABLE "pages_blocks_stack" CASCADE;
  DROP TABLE "_pages_v_blocks_place" CASCADE;
  DROP TABLE "_pages_v_blocks_stack" CASCADE;
  DROP TABLE "place_tag" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_place_tag_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_place_tag_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_place_tag_fk";
  
  DROP INDEX IF EXISTS "pages_rels_place_tag_id_idx";
  DROP INDEX IF EXISTS "_pages_v_rels_place_tag_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_place_tag_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "place_tag_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN IF EXISTS "place_tag_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "place_tag_id";
  DROP TYPE "public"."enum_pages_blocks_stack_direction";
  DROP TYPE "public"."enum__pages_v_blocks_stack_direction";`);
}
