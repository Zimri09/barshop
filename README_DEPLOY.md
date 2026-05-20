# BarStock — Deployment Guide

Fullstack liquor shop management: Vite + React frontend + Express backend + Supabase.

---

## Environment Variables

### `packages/client/.env`

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### `packages/server/.env`

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
PORT=3001
```

---

## Database Setup

Run the SQL in `supabase/schema.sql` against your Supabase project via the SQL editor.

---

## Demo Users

Create users via Supabase Auth (Dashboard → Authentication → Users) with email format `<username>@barstock.local`, then run:

```
cd packages/server
node scripts/bootstrap-default-users.js
```

Or manually set roles in the `profiles` table:

- `jireh@barstock.local` → role: `admin`
- `jai@barstock.local` → role: `staff`
- Customer users → role: `customer`

---

## Local Development

```
# Root (installs all workspaces)
npm install

# Start backend (port 3001)
cd packages/server
npm run dev

# Start frontend (port 5174)
cd packages/client
npm run dev
```

Frontend proxies `/api` → `http://localhost:3001` via Vite config.

---

## Production Build

```
cd packages/client
npm run build
# Outputs to packages/client/dist
```

Serve `packages/client/dist` as static files (e.g. Vercel, Netlify, Nginx).

Deploy `packages/server` as a Node.js server (e.g. Railway, Render, Fly.io).

---

## Notes

- **Node.js < 22**: The `ws` package is required in `packages/server` for Supabase realtime.
- **Supabase auth lock**: The client is configured with a no-op lock function (`auth.lock`) to avoid `navigator.locks` deadlocks in Supabase JS v2.106+.
- **CORS**: Update the CORS origin in `packages/server/index.js` for production frontend URLs.
