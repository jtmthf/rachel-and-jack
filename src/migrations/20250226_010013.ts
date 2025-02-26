import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pages_blocks_schedule_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone DEFAULT '2025-09-06T05:00:00.000Z',
  	"time" varchar,
  	"description" jsonb,
  	"location" varchar,
  	"attire" varchar,
  	"draft" boolean DEFAULT false
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_schedule_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone DEFAULT '2025-09-06T05:00:00.000Z',
  	"time" varchar,
  	"description" jsonb,
  	"location" varchar,
  	"attire" varchar,
  	"draft" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_schedule_events" ADD CONSTRAINT "pages_blocks_schedule_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_schedule"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_schedule" ADD CONSTRAINT "pages_blocks_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_schedule_events" ADD CONSTRAINT "_pages_v_blocks_schedule_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_schedule"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_schedule" ADD CONSTRAINT "_pages_v_blocks_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_events_order_idx" ON "pages_blocks_schedule_events" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_events_parent_id_idx" ON "pages_blocks_schedule_events" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_order_idx" ON "pages_blocks_schedule" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_parent_id_idx" ON "pages_blocks_schedule" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_path_idx" ON "pages_blocks_schedule" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_events_order_idx" ON "_pages_v_blocks_schedule_events" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_events_parent_id_idx" ON "_pages_v_blocks_schedule_events" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_order_idx" ON "_pages_v_blocks_schedule" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_parent_id_idx" ON "_pages_v_blocks_schedule" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_path_idx" ON "_pages_v_blocks_schedule" USING btree ("_path");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_schedule_events" CASCADE;
  DROP TABLE "pages_blocks_schedule" CASCADE;
  DROP TABLE "_pages_v_blocks_schedule_events" CASCADE;
  DROP TABLE "_pages_v_blocks_schedule" CASCADE;`);
}
