# University Management System frontend

The Next.js App Router frontend for the University Management System. It uses
the established `src/` layout, TanStack Query for server state, and the backend
REST API under `/api/v1`.

## Configure the API

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Set `NEXT_PUBLIC_API_BASE_URL` to the backend origin plus `/api/v1`. Browser
requests use the frontend's `/api/v1` path and Next.js rewrites them to this
backend URL, keeping cookie-based authentication on the frontend origin. For
Vercel, configure this variable in the frontend project and redeploy. The
backend deployment must be publicly accessible to the frontend rewrite; disable
Vercel Authentication for its Production deployment. The backend must also
allow the frontend origin with credentialed CORS. Google sign-in is shown only
when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured.

## Run locally

Install dependencies with the package manager configured by `package.json`,
then start the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The authenticated shell
loads the current user from `GET /api/v1/user/me`.

## Validation

```bash
bun run lint
bun run build
```

The frontend consumes the backend API and does not implement academic,
authorization, or payment business rules locally.
