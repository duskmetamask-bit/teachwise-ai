TeachWise is a Next.js teacher workspace for lesson generation, report writing, email handling, rubrics, and exports.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

For local-only mode, no extra environment variables are required.

To turn on Supabase auth and user-scoped workspace persistence, create a `.env.local` from `.env.example` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Apply the SQL in `supabase/teachwise_schema.sql` to your Supabase project before expecting hosted workspace persistence.

## Current Architecture

- Local fallback workspace persistence lives in `.data/teachwise-workspace.json`
- Hosted SaaS-ready persistence uses Supabase Auth plus the `workspace_snapshots` table
- The app automatically falls back to local file storage when Supabase is not configured yet

## Deploy

The app is deployed on Vercel. Production checks should be done against the live project as well as local dev when auth or server persistence changes.
