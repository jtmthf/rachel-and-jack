import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "things_to_do" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "things_to_do_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"things_to_do_category_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "things_to_do_category" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_media_fk";
  
  DROP INDEX IF EXISTS "media_email_idx";
  DROP INDEX IF EXISTS "payload_preferences_rels_media_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "things_to_do_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "things_to_do_category_id" integer;
  DO $$ BEGIN
   ALTER TABLE "things_to_do" ADD CONSTRAINT "things_to_do_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "things_to_do_rels" ADD CONSTRAINT "things_to_do_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."things_to_do"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "things_to_do_rels" ADD CONSTRAINT "things_to_do_rels_things_to_do_category_fk" FOREIGN KEY ("things_to_do_category_id") REFERENCES "public"."things_to_do_category"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "things_to_do_image_idx" ON "things_to_do" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "things_to_do_updated_at_idx" ON "things_to_do" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "things_to_do_created_at_idx" ON "things_to_do" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "things_to_do_rels_order_idx" ON "things_to_do_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "things_to_do_rels_parent_idx" ON "things_to_do_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "things_to_do_rels_path_idx" ON "things_to_do_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "things_to_do_rels_things_to_do_category_id_idx" ON "things_to_do_rels" USING btree ("things_to_do_category_id");
  CREATE INDEX IF NOT EXISTS "things_to_do_category_slug_idx" ON "things_to_do_category" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "things_to_do_category_updated_at_idx" ON "things_to_do_category" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "things_to_do_category_created_at_idx" ON "things_to_do_category" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_things_to_do_fk" FOREIGN KEY ("things_to_do_id") REFERENCES "public"."things_to_do"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_things_to_do_category_fk" FOREIGN KEY ("things_to_do_category_id") REFERENCES "public"."things_to_do_category"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_things_to_do_id_idx" ON "payload_locked_documents_rels" USING btree ("things_to_do_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_things_to_do_category_id_idx" ON "payload_locked_documents_rels" USING btree ("things_to_do_category_id");
  ALTER TABLE "media" DROP COLUMN IF EXISTS "email";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "reset_password_token";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "reset_password_expiration";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "salt";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "hash";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "login_attempts";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "lock_until";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "media_id";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "things_to_do" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "things_to_do_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "things_to_do_category" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "things_to_do" CASCADE;
  DROP TABLE "things_to_do_rels" CASCADE;
  DROP TABLE "things_to_do_category" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_things_to_do_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_things_to_do_category_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_things_to_do_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_things_to_do_category_id_idx";
  ALTER TABLE "media" ADD COLUMN "email" varchar NOT NULL;
  ALTER TABLE "media" ADD COLUMN "reset_password_token" varchar;
  ALTER TABLE "media" ADD COLUMN "reset_password_expiration" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "salt" varchar;
  ALTER TABLE "media" ADD COLUMN "hash" varchar;
  ALTER TABLE "media" ADD COLUMN "login_attempts" numeric DEFAULT 0;
  ALTER TABLE "media" ADD COLUMN "lock_until" timestamp(3) with time zone;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "media_id" integer;
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE UNIQUE INDEX IF NOT EXISTS "media_email_idx" ON "media" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_media_id_idx" ON "payload_preferences_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "things_to_do_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "things_to_do_category_id";`);
}
