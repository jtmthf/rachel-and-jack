import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_registry_purchase_purchased_at" AS ENUM('online', 'in-store');
  CREATE TABLE IF NOT EXISTS "pages_blocks_registry" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_registry" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "registry_purchase" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"registry_item_id" integer NOT NULL,
  	"quantity" numeric NOT NULL,
  	"purchased_at" "enum_registry_purchase_purchased_at" NOT NULL,
  	"order_number" varchar,
  	"purchaser_name" varchar NOT NULL,
  	"purchaser_email" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "registry_purchase_id" integer;
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_registry" ADD CONSTRAINT "pages_blocks_registry_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_registry" ADD CONSTRAINT "_pages_v_blocks_registry_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "registry_purchase" ADD CONSTRAINT "registry_purchase_registry_item_id_registry_item_id_fk" FOREIGN KEY ("registry_item_id") REFERENCES "public"."registry_item"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_registry_order_idx" ON "pages_blocks_registry" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_registry_parent_id_idx" ON "pages_blocks_registry" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_registry_path_idx" ON "pages_blocks_registry" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_registry_order_idx" ON "_pages_v_blocks_registry" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_registry_parent_id_idx" ON "_pages_v_blocks_registry" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_registry_path_idx" ON "_pages_v_blocks_registry" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "registry_purchase_registry_item_idx" ON "registry_purchase" USING btree ("registry_item_id");
  CREATE INDEX IF NOT EXISTS "registry_purchase_updated_at_idx" ON "registry_purchase" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "registry_purchase_created_at_idx" ON "registry_purchase" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_registry_purchase_fk" FOREIGN KEY ("registry_purchase_id") REFERENCES "public"."registry_purchase"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_registry_purchase_id_idx" ON "payload_locked_documents_rels" USING btree ("registry_purchase_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_registry" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_registry" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "registry_purchase" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_registry" CASCADE;
  DROP TABLE "_pages_v_blocks_registry" CASCADE;
  DROP TABLE "registry_purchase" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_registry_purchase_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_registry_purchase_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "registry_purchase_id";
  DROP TYPE "public"."enum_registry_purchase_purchased_at";`);
}
