# Deployment

Nothing has been deployed and no paid service has been created. These are the steps to do so.

## Vercel

1. Import the GitHub repository in Vercel. The framework is detected as Next.js; no build settings need changing.
2. Add environment variables (Project → Settings → Environment Variables). See `.env.example`.
   - `ANTHROPIC_API_KEY` – required for AI explanations. Create it at console.anthropic.com and set a monthly spend limit there.
   - `NEXT_PUBLIC_SITE_URL` – the public address, e.g. `https://myconstitution.sc`.
   - Optional: `AI_MODEL`, `AI_PLANNER_MODEL`, `AI_EFFORT`, `ASK_LIMIT_PER_MINUTE`, `ASK_LIMIT_PER_DAY`, `AI_DAILY_LIMIT`.
3. Deploy. `/api/ask` declares `maxDuration = 90` seconds; confirm your plan allows it or lower `AI_EFFORT`.
4. After the first deploy, run the live checks in `docs/TESTING.md` ("Before launch").

Recommended before public launch: enable Vercel's firewall rate-limit rule on `/api/ask` (the built-in limiter is per instance), and set a spend limit on the Anthropic key.

## Any Node host

```bash
npm ci
npm run build
ANTHROPIC_API_KEY=... npm start
```

Put it behind a proxy that sets `X-Forwarded-For`, otherwise all visitors share one rate-limit bucket.

## Supabase (optional)

The site does not need a database. To load the schema and data anyway:

```bash
node scripts/export-sql.mjs > supabase/seed.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261116000000_init.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

Use a new, dedicated Supabase project so this data and its policies are isolated from other applications. Run these with the database owner connection from a trusted machine; never put the service-role key in the web app.
