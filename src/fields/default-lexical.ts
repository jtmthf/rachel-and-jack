import { lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical';
import { Config } from 'payload';

export const defaultLexical: Config['editor'] = lexicalEditor({
  features: ({ defaultFeatures }) => {
    return [
      ...defaultFeatures,
      LinkFeature({
        enabledCollections: ['pages'],
      }),
    ];
  },
});
