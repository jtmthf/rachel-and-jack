import {
  MigrateDownArgs,
  MigrateUpArgs,
  sql,
} from '@payloadcms/db-vercel-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "size" SET DEFAULT 'full';
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "size" SET DEFAULT 'full';
  ALTER TABLE "pages_blocks_content" ADD COLUMN "separator" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "separator" boolean DEFAULT false;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "size" SET DEFAULT 'oneThird';
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "size" SET DEFAULT 'oneThird';
  ALTER TABLE "pages_blocks_content" DROP COLUMN IF EXISTS "separator";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN IF EXISTS "separator";`);
}
