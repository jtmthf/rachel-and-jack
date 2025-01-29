import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pages_blocks_things_to_do" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"things_to_do_category_id" integer,
  	"things_to_do_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_things_to_do" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"things_to_do_category_id" integer,
  	"things_to_do_id" integer
  );
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_things_to_do" ADD CONSTRAINT "pages_blocks_things_to_do_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_things_to_do_category_fk" FOREIGN KEY ("things_to_do_category_id") REFERENCES "public"."things_to_do_category"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_things_to_do_fk" FOREIGN KEY ("things_to_do_id") REFERENCES "public"."things_to_do"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_things_to_do" ADD CONSTRAINT "_pages_v_blocks_things_to_do_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_things_to_do_category_fk" FOREIGN KEY ("things_to_do_category_id") REFERENCES "public"."things_to_do_category"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_things_to_do_fk" FOREIGN KEY ("things_to_do_id") REFERENCES "public"."things_to_do"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_things_to_do_order_idx" ON "pages_blocks_things_to_do" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_things_to_do_parent_id_idx" ON "pages_blocks_things_to_do" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_things_to_do_path_idx" ON "pages_blocks_things_to_do" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "pages_rels_things_to_do_category_id_idx" ON "pages_rels" USING btree ("things_to_do_category_id");
  CREATE INDEX IF NOT EXISTS "pages_rels_things_to_do_id_idx" ON "pages_rels" USING btree ("things_to_do_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_things_to_do_order_idx" ON "_pages_v_blocks_things_to_do" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_things_to_do_parent_id_idx" ON "_pages_v_blocks_things_to_do" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_things_to_do_path_idx" ON "_pages_v_blocks_things_to_do" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_things_to_do_category_id_idx" ON "_pages_v_rels" USING btree ("things_to_do_category_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_things_to_do_id_idx" ON "_pages_v_rels" USING btree ("things_to_do_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_things_to_do" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_things_to_do" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;`);
}
