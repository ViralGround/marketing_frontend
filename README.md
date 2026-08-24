This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Sanitized staging configuration

Use [`.env.preproduction.example`](.env.preproduction.example) as the canonical
variable-name and fail-closed-default contract for the isolated Vercel staging
project. Do not derive staging from the production-shaped `.env.example` and do
not commit a populated copy. The five `NEXT_PUBLIC_LEGAL_*` values must come
from the same approval record as the backend `LEGAL_*` values; the protected
staging signup contract test rejects a deployment pair that advances only one
side. A protected Vercel staging build also requires `APP_ENV=preproduction`
and exact `VERCEL_ENV=production` in the isolated staging project,
both Sentry environments set exactly to `preproduction`, both Sentry releases
set to the full frontend commit SHA, and both browser/server DSNs contained in
their distinct, role-specific approved `host/projectId` identities. The
approved identities never contain the DSN public key. The validator identifies
only the failing variable and never prints a DSN. Generic local and CI builds
that are not a protected Vercel deployment may continue to exercise the safe,
feature-disabled staging topology without populated Sentry approval values.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
