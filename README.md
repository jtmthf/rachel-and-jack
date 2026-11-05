# Rachel & Jack

The website for Rachel and Jack's wedding on September 6, 2025. It now stays up
as a read-only keepsake, and the code is here for anyone who wants to fork it
for their own wedding.

It has a photo gallery, pages managed in a CMS, a gift registry and a honeymoon
fund.

## Stack

- [Next.js](https://nextjs.org) App Router, deployed on Vercel
- [Payload CMS](https://payloadcms.com) on Postgres, with its admin at `/admin`
- S3 for gallery photos, resized on request by `/api/image` with
  [sharp](https://sharp.pixelplumbing.com)
- Vercel Blob for other media uploads
- [Stripe](https://stripe.com) for the Honeymoon Fund
- Mixpanel for analytics and Sentry for error reporting

`GLOSSARY.md` defines the terms used in the code, such as the difference between
a Registry Purchase and a Honeymoon Contribution.

## Run it locally

You need Node 24, pnpm and a Postgres database.

```bash
pnpm install
cp .env.example .env.local
```

In `.env.local`, set `DATABASE_URL` to your database and `PAYLOAD_SECRET` to a
random string, for example from `openssl rand -hex 32`. Nothing else is needed
to start. Then create the tables and start the site:

```bash
pnpm payload migrate
pnpm dev
```

Open [localhost:3000](http://localhost:3000) for the site and
[localhost:3000/admin](http://localhost:3000/admin) to create your first admin
user.

`pnpm test` runs the unit tests.

## Make it yours

Replace the personal content before you publish:

| What                                    | Where                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------ |
| Names, date, venue, honeymoon location  | `src/site.config.ts`                                                     |
| The story                               | `src/app/(frontend)/our-story/page.mdx` and its `layout.tsx`             |
| Home page photo                         | `src/app/(frontend)/engagement.png`                                      |
| Favicons and other images               | `public/`                                                                |
| Pages, navigation and registry items    | `/admin`                                                                 |
| Visual test snapshots and their default | `tests/screenshot.spec.ts-snapshots`, `.github/workflows/playwright.yml` |

## Optional services

The site runs without these, but the features that need them won't work until
you set them up. `.env.example` lists every variable.

### Site URL

Set `NEXT_PUBLIC_SERVER_URL` to your site's origin. The sitemap and `robots.txt`
use it. On Vercel it falls back to the project's production domain.

### Photo gallery

The AWS CDK stack in `cdk/` creates the bucket and a role that only your Vercel
project's production environment can assume. It needs
[Vercel OIDC federation](https://vercel.com/docs/oidc/aws) set up in your AWS
account.

```bash
pnpm exec cdk deploy -c vercelTeam=<team-slug> -c vercelProject=<project-name>
```

Use the stack's outputs for `AWS_ROLE_ARN`, `S3_BUCKET` and
`NEXT_PUBLIC_S3_BUCKET`, and set `AWS_REGION`. `/api/image` only fetches
originals from that bucket, and saves what it resizes there under
`derivatives/`. To let it fetch from other hosts as well, add them to
`REMOTE_PATTERNS` in `src/lib/image-server.ts`.

Photos imported without the admin need two one-off scripts, whose headers
explain how to run them. `scripts/backfill-photo-placeholders.ts` adds their
blur placeholders, and `scripts/warm-images.mjs` saves their full-size files so
that nobody waits for the first resize.

### Registry and Honeymoon Fund

The registry is closed unless `REGISTRY_OPEN` is exactly `true`. While it's
closed, the pages still show the items, but purchases and contributions are
refused. Registry Purchases don't need Stripe. The Honeymoon Fund does:

1. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`.
2. In Stripe, add a webhook to `https://<your-site>/api/stripe/webhook` for
   `payment_intent.succeeded` and `payment_intent.payment_failed`.
3. Set `STRIPE_WEBHOOK_SECRET` to the webhook's signing secret.

The webhook is what marks a Honeymoon Contribution as paid.

### Analytics and error reporting

Set the `MIXPANEL_*` variables for analytics. For Sentry, set
`NEXT_PUBLIC_SENTRY_DSN`, plus `SENTRY_ORG`, `SENTRY_PROJECT` and
`SENTRY_AUTH_TOKEN` if you want source maps uploaded during builds.

## Deploy

Import the repo into Vercel, add a Postgres database and set the variables from
`.env.example`. Set the build command to `pnpm build:ci` so that migrations run
before each build.

## License

The source code is under the [MIT License](LICENSE).

The license doesn't cover the personal content: photos and other images,
including visual test snapshots, the story in `our-story`, and Rachel and Jack's
names and wedding details. Please replace these in your fork. All rights in them
are reserved.
