# $WISH governance feature flag

The `/wish` route and the `$WISH` navigation link are controlled by the
`wish-governance-page` feature flag that is implemented with the Vercel Flags
SDK. This document explains how the flag flows through the app and how you can
override it in different environments.

## How flag evaluation works

1. The flag definition lives in [`src/flags/index.ts`](src/flags/index.ts).
   - The `flag` helper from `@vercel/flags/next` returns an async function
     (`wishGovernancePageFlag`) that resolves to the boolean value for the
     current request.
   - Vercel's edge network can inject a resolved value for the flag (for
     example when toggled in the dashboard). If that happens, our code simply
     returns the injected value.
   - When there is no upstream decision, the `decide` callback runs locally as a
     fallback. We allow local development (`NODE_ENV=development`) to see the
     page by default while keeping every other environment disabled unless an
     override is provided.

2. The route handler in
   [`src/app/.well-known/vercel/flags/route.ts`](src/app/.well-known/vercel/flags/route.ts)
   exposes the flag metadata. Vercel's dashboard and CLI read this endpoint to
   list the flag, show its description, and toggle its value per environment.

3. The root layout (`src/app/layout.tsx`) awaits `wishGovernancePageFlag()` on
   the server. The resulting value is passed to the navigation so the `$WISH`
   link only renders when the flag is enabled. The `/wish` page itself checks the
   same flag and issues `notFound()` if the feature is disabled.

## Overriding the flag value

- **Vercel dashboard / CLI** – Once the project is connected to Vercel Flags,
  the `wish-governance-page` toggle can be flipped per environment (preview or
  production). Those choices are injected into the request automatically, so no
  code changes are required after deployment.
- **Environment variable override** – Setting
  `NEXT_PUBLIC_WISH_GOVERNANCE_PAGE` to either `true` or `false` forces the
  fallback decision. This is handy for local previews or when running the app in
  an environment without Vercel's flag provider.
- **Default behaviour** – Without any override, the feature is available only in
  local development builds. Preview and production deployments require an
  explicit toggle before the governance experience becomes public.

## Testing the flag locally

1. Run the development server (`npm run dev`). The page and navigation entry will
   be visible because `NODE_ENV=development`.
2. To simulate the feature being off, set
   `NEXT_PUBLIC_WISH_GOVERNANCE_PAGE=false` in your shell before starting the
   dev server.
3. To simulate the feature being rolled out elsewhere, set
   `NEXT_PUBLIC_WISH_GOVERNANCE_PAGE=true`.

Following these steps mirrors how the flag behaves when managed via Vercel
Flags, making it easy to validate the rollout path before promoting changes.
