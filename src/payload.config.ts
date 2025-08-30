import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres';
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { stripePlugin } from '@payloadcms/plugin-stripe';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { HoneymoonContribution } from './collections/HoneymoonContribution';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { PlaceTag } from './collections/PlaceTag';
import { RegistryCategory } from './collections/Registry/RegistryCategory';
import { RegistryItem } from './collections/Registry/RegistryItem';
import { RegistryPurchase } from './collections/Registry/RegistryPurchase';
import { RegistryStore } from './collections/Registry/RegistryStore';
import { ThingsToDo } from './collections/ThingsToDo';
import { ThingsToDoCategory } from './collections/ThingsToDoCategory';
import { Users } from './collections/Users';
import { defaultLexical } from './fields/default-lexical';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    HoneymoonContribution,
    Media,
    Pages,
    PlaceTag,
    RegistryCategory,
    RegistryItem,
    RegistryPurchase,
    RegistryStore,
    ThingsToDo,
    ThingsToDoCategory,
    Users,
  ],
  editor: defaultLexical,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      rest: true,
    }),
  ],
});
