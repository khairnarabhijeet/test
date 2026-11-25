# RideShare MVP

RideShare MVP is built with Next.js, Tailwind CSS, Supabase Authentication/PostgreSQL, and WhatsApp deep links.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and anon key.
3. Run the SQL migration in `supabase/migrations/001_rideshare_mvp.sql`.
4. Enable Google authentication in Supabase and configure redirect URLs.
5. Install dependencies and start the application:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```powershell
npm run lint
npm test
npm run build
```

Supabase setup details are documented in `supabase/README.md`.
