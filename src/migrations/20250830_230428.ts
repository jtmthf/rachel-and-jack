import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_honeymoon_contributions_status" AS ENUM('pending', 'completed', 'failed');
  CREATE TABLE "honeymoon_contributions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"amount" numeric NOT NULL,
  	"message" varchar,
  	"stripe_payment_intent_id" varchar NOT NULL,
  	"status" "enum_honeymoon_contributions_status" DEFAULT 'pending',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "honeymoon_contributions_id" integer;
  CREATE UNIQUE INDEX "honeymoon_contributions_stripe_payment_intent_id_idx" ON "honeymoon_contributions" USING btree ("stripe_payment_intent_id");
  CREATE INDEX "honeymoon_contributions_updated_at_idx" ON "honeymoon_contributions" USING btree ("updated_at");
  CREATE INDEX "honeymoon_contributions_created_at_idx" ON "honeymoon_contributions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_honeymoon_contributions_fk" FOREIGN KEY ("honeymoon_contributions_id") REFERENCES "public"."honeymoon_contributions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_honeymoon_contributions_id_idx" ON "payload_locked_documents_rels" USING btree ("honeymoon_contributions_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "honeymoon_contributions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "honeymoon_contributions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_honeymoon_contributions_fk";
  
  DROP INDEX "payload_locked_documents_rels_honeymoon_contributions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "honeymoon_contributions_id";
  DROP TYPE "public"."enum_honeymoon_contributions_status";`);
}
