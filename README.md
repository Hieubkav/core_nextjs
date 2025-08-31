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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1) Prepare environment variables in Vercel (Project → Settings → Environment Variables). See `.env.example` for the full list. Required:

- `DATABASE_URL`, `DIRECT_URL` (Postgres, enable SSL; pooling on `DATABASE_URL`)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `APP_URL`, `NEXT_PUBLIC_BASE_URL`

2) First-time database setup (one-time):

- This repo includes Prisma migrations at `prisma/migrations`. To apply them to your production DB: `npx prisma migrate deploy`.
- Optionally seed sample data: `npm run seed`.

3) Build configuration:

- `vercel.json` sets the build command to `npm run build:vercel` which runs: `prisma generate && prisma migrate deploy && next build`.

4) Deploy

- Using Vercel CLI: `vercel`, then `vercel --prod`.

Notes:

- Prisma Client output is generated to `src/generated/prisma` via `prisma/schema.prisma` generator config.
- Image upload uses Supabase Storage; Next Image remote patterns are configured in `next.config.js`.
