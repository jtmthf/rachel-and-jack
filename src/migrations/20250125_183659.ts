import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pages_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_accordion_items" ADD CONSTRAINT "pages_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_accordion" ADD CONSTRAINT "pages_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_card" ADD CONSTRAINT "pages_blocks_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_accordion_items_order_idx" ON "pages_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_accordion_items_parent_id_idx" ON "pages_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_accordion_order_idx" ON "pages_blocks_accordion" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_accordion_parent_id_idx" ON "pages_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_accordion_path_idx" ON "pages_blocks_accordion" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_card_order_idx" ON "pages_blocks_card" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_card_parent_id_idx" ON "pages_blocks_card" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_card_path_idx" ON "pages_blocks_card" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "pages_created_at_idx" ON "pages" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_accordion_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_accordion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_accordion_items" CASCADE;
  DROP TABLE "pages_blocks_accordion" CASCADE;
  DROP TABLE "pages_blocks_card" CASCADE;
  DROP TABLE "pages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "pages_id";`);
}
