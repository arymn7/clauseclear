# ClauseClear

ClauseClear is a contract review workspace built with Next.js for the product surface and a Python analysis service for document processing. An authenticated user can upload a PDF and receive a structured AI analysis with summary, risks, obligations, red flags, and clause-by-clause notes.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- FastAPI
- Python
- Supabase Auth and Postgres
- Google Gemini
- Tailwind CSS 4

## Features

- Google OAuth sign-in with Supabase
- Protected dashboard routes via middleware
- PDF upload from the web app to a dedicated Python analysis service
- PDF text extraction and Gemini analysis inside the Python service
- Per-user analysis history stored in Supabase with row-level security
- Theme toggle and browser-persisted workspace preferences

## Architecture

- `app/(public)/page.tsx`: landing page and sign-in entry point
- `app/dashboard/page.tsx`: upload flow and recent analysis history
- `app/dashboard/analyses/page.tsx`: full history view
- `app/api/analyze/route.ts`: authenticated PDF ingestion, Python service orchestration, and persistence
- `app/api/analyses/route.ts`: authenticated history fetch
- `lib/python-analysis-service.ts`: server-side client for the Python service
- `python_service/main.py`: FastAPI analysis service with PDF parsing and Gemini integration
- `supabase/migrations/0001_contract_analyses.sql`: analysis table and RLS policies

## Environment Variables

Copy `.env.example` to `.env.local` and provide:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANALYSIS_SERVICE_URL`

For the Python service, copy `python_service/.env.example` into your Python runtime environment and provide:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`

## Local Development

```bash
npm install
npm run dev:web
```

Open `http://localhost:3000`.

Start the Python service separately:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r python_service/requirements.txt
npm run dev:python
```

## Supabase Setup

1. Create a Supabase project.
2. Enable Google as an auth provider.
3. Add `http://localhost:3000/auth/callback` as an OAuth redirect URL for local development.
4. Apply the SQL in `supabase/migrations/0001_contract_analyses.sql`.
5. Set `ANALYSIS_SERVICE_URL` in `.env.local` to the Python service base URL.

## Production Readiness Notes

- The Next.js app requires valid Supabase credentials and a reachable Python analysis service.
- The Python service requires valid Gemini credentials.
- Analysis history is persisted server-side in `contract_analyses`.
- Workspace settings are intentionally stored in browser local storage rather than in the database.

## Scripts

- `npm run dev`: start the Next.js development server
- `npm run dev:web`: start the Next.js development server
- `npm run dev:python`: start the FastAPI analysis service
- `npm run build`: create a production build
- `npm run lint`: run ESLint
- `npm run start`: run the production server
