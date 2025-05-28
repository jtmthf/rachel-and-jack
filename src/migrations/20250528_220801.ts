import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_registry_item_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_registry_item_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_registry_item_v" CASCADE;
  DROP TABLE "_registry_item_v_rels" CASCADE;
  DROP INDEX IF EXISTS "registry_item__status_idx";
  ALTER TABLE "pages_blocks_schedule_events" ALTER COLUMN "date" SET DEFAULT '2025-09-06T04:00:00.000Z';
  ALTER TABLE "_pages_v_blocks_schedule_events" ALTER COLUMN "date" SET DEFAULT '2025-09-06T04:00:00.000Z';
  ALTER TABLE "registry_item" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "registry_item" ALTER COLUMN "price" SET NOT NULL;
  ALTER TABLE "registry_item" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "registry_item" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "pages_rels" ADD COLUMN "registry_item_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "registry_item_id" integer;
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_registry_item_fk" FOREIGN KEY ("registry_item_id") REFERENCES "public"."registry_item"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_registry_item_fk" FOREIGN KEY ("registry_item_id") REFERENCES "public"."registry_item"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_rels_registry_item_id_idx" ON "pages_rels" USING btree ("registry_item_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_registry_item_id_idx" ON "_pages_v_rels" USING btree ("registry_item_id");
  ALTER TABLE "registry_item" DROP COLUMN IF EXISTS "_status";
  DROP TYPE "public"."enum_registry_item_status";
  DROP TYPE "public"."enum__registry_item_v_version_status";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_registry_item_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__registry_item_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE IF NOT EXISTS "_registry_item_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" jsonb,
  	"version_store_id" integer,
  	"version_price" numeric,
  	"version_url" varchar,
  	"version_quantity_requested" numeric,
  	"version_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__registry_item_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_registry_item_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"registry_category_id" integer
  );
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_registry_item_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_registry_item_fk";
  
  DROP INDEX IF EXISTS "pages_rels_registry_item_id_idx";
  DROP INDEX IF EXISTS "_pages_v_rels_registry_item_id_idx";
  ALTER TABLE "pages_blocks_schedule_events" ALTER COLUMN "date" SET DEFAULT '2025-09-06T05:00:00.000Z';
  ALTER TABLE "_pages_v_blocks_schedule_events" ALTER COLUMN "date" SET DEFAULT '2025-09-06T05:00:00.000Z';
  ALTER TABLE "registry_item" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "registry_item" ALTER COLUMN "price" DROP NOT NULL;
  ALTER TABLE "registry_item" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "registry_item" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "registry_item" ADD COLUMN "_status" "enum_registry_item_status" DEFAULT 'draft';
  DO $$ BEGIN
   ALTER TABLE "_registry_item_v" ADD CONSTRAINT "_registry_item_v_parent_id_registry_item_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."registry_item"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_registry_item_v" ADD CONSTRAINT "_registry_item_v_version_store_id_registry_store_id_fk" FOREIGN KEY ("version_store_id") REFERENCES "public"."registry_store"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_registry_item_v" ADD CONSTRAINT "_registry_item_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_registry_item_v_rels" ADD CONSTRAINT "_registry_item_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_registry_item_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_registry_item_v_rels" ADD CONSTRAINT "_registry_item_v_rels_registry_category_fk" FOREIGN KEY ("registry_category_id") REFERENCES "public"."registry_category"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "_registry_item_v_parent_idx" ON "_registry_item_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_version_version_store_idx" ON "_registry_item_v" USING btree ("version_store_id");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_version_version_image_idx" ON "_registry_item_v" USING btree ("version_image_id");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_version_version_updated_at_idx" ON "_registry_item_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_version_version_created_at_idx" ON "_registry_item_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_version_version__status_idx" ON "_registry_item_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_created_at_idx" ON "_registry_item_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_updated_at_idx" ON "_registry_item_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_latest_idx" ON "_registry_item_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_autosave_idx" ON "_registry_item_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_rels_order_idx" ON "_registry_item_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_rels_parent_idx" ON "_registry_item_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_rels_path_idx" ON "_registry_item_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_registry_item_v_rels_registry_category_id_idx" ON "_registry_item_v_rels" USING btree ("registry_category_id");
  CREATE INDEX IF NOT EXISTS "registry_item__status_idx" ON "registry_item" USING btree ("_status");
  ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "registry_item_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN IF EXISTS "registry_item_id";`);
}
