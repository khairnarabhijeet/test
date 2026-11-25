# Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_rideshare_mvp.sql` in the Supabase SQL editor.
3. In Supabase, open **Authentication > Sign In / Providers > Google** and enable Google.
4. Create a Google OAuth client in Google Cloud Console. Set the authorized redirect URI to:

   `https://<your-project-ref>.supabase.co/auth/v1/callback`

   Copy the Google client ID and client secret into the Supabase Google provider settings and save.
5. In Supabase **Authentication > URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to the redirect URLs. Add your deployed site's callback URL when deploying.
6. Copy the Supabase project URL and anon/public key (not the service-role key) into `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

7. Restart `npm run dev` after saving `.env.local`.

The app also supports `NEXT_PUBLIC_SUPABASE_ANON_KEY` for older projects. Never put the Google client secret or a Supabase service-role key in this Next.js application's environment variables. The Google client secret belongs only in the Supabase dashboard.

The local `dev` and `start` scripts enable Node's system CA store so Supabase requests work in environments that use a trusted corporate TLS inspection certificate. TLS verification remains enabled.
