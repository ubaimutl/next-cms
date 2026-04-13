# next-cms

A modular Next.js CMS starter with a polished admin workspace, PostgreSQL via Prisma, media management, blogging, portfolio content, and lightweight commerce.

![next-cms preview](docs/preview.gif)

## Demo

- Site: `https://next-cms-demo-six.vercel.app`
- Admin: `https://next-cms-demo-six.vercel.app/admin/login`
- Email: `demo@next-cms.demo`
- Password: `next-cms.demoXu678!`

## Overview

`next-cms` is a production-oriented starter for studios, freelancers, and product teams that want a self-hosted CMS on a modern Next.js stack without adopting a larger framework.

It ships with a custom admin interface, role-based access, content modules for publishing and portfolio work, optional commerce primitives, email-based contact handling, and deploy-friendly infrastructure choices for Vercel.

## Core Features

- Posts and blog publishing with a focused editor experience
- Projects and work archive for case studies or portfolio content
- Shop module for digital products and service offers
- Media library backed by Vercel Blob
- Contact inbox and message management
- Analytics overview inside the admin workspace
- Multi-user admin with `OWNER`, `ADMIN`, and `EDITOR` roles
- Per-post and per-product SEO fields
- Email-confirmed password changes for admin accounts
- Module toggles for blog, projects, shop, and analytics

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Vercel Blob for uploads
- Nodemailer for transactional email
- Novel editor for rich post editing

## Admin Roles

The admin supports three roles:

- `OWNER`: protected bootstrap role with full control
- `ADMIN`: full operational access, including user management
- `EDITOR`: content-focused access without user or operational controls

The first account created through `/admin/login` becomes the initial `OWNER`.

## Getting Started

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Apply database migrations:

```bash
npx prisma migrate dev --name init
```

Start the development server:

```bash
npm run dev
```

## Demo Content

Load sample data:

```bash
npm run db:seed-dummy
```

## Environment

At minimum, configure:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SITE_URL`

Optional integrations:

- `SMTP_*`, `CONTACT_*`, and `AUTH_FROM_EMAIL` for email delivery
- `BLOB_READ_WRITE_TOKEN` for media uploads
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_ENV` for the shop checkout flow

Use the pooled database URL for `DATABASE_URL` in runtime environments and the direct database URL for `DIRECT_URL` in Prisma CLI operations.

## Deployment

This project is designed to deploy cleanly on Vercel with PostgreSQL and Blob storage.

Before the first production deployment, apply migrations:

```bash
npx prisma migrate deploy
```

Recommended production setup:

- Vercel for hosting
- Neon Postgres for the database
- Vercel Blob for media storage

## Notes

- Disabled modules are hidden from public navigation and their public routes return `404`
- Uploaded assets are tracked in the admin media library
- Password changes require email confirmation before the new password is applied
- If you use Neon, prefer the `-pooler` hostname for `DATABASE_URL`

## License

MIT
