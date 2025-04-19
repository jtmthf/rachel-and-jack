// storage-adapter-import-placeholder
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres';
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { PlaceTag } from './collections/PlaceTag';
import { RegistryCategory } from './collections/Registry/RegistryCategory';
import { RegistryItem } from './collections/Registry/RegistryItem';
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
    Users,
    Media,
    Pages,
    PlaceTag,
    RegistryCategory,
    RegistryItem,
    RegistryStore,
    ThingsToDo,
    ThingsToDoCategory,
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
  ],
});
