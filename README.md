# EximHub Platform

EximHub is a trade intelligence, buyer discovery, and exporter support platform.

This repository contains:
- `web/` public website and user dashboard
- `api/` backend services and auth/import logic
- `admin_panel/` admin operations UI
- `mobile/` mobile application
- `database/` schema, imports, and exports

## Start Here

Before making changes, read these files first:

1. `PROJECT_CONTEXT.md`
2. `AI_RULES.md`
3. `DECISIONS.md`
4. `HANDOFF.md`

These files are required reading for:
- developers
- operators
- AI assistants
- anyone continuing work from a previous session

## Why This Matters

EximHub is being developed by multiple people and may also be worked on by multiple OpenAI/Codex accounts. The repository documentation is the source of truth and should be used instead of relying on memory or past chat context.

## Local Setup

See:
- `LOCAL_SETUP.md`
- `database/README.md`
- `web/README.md`
- `admin_panel/README.md`
- `api/IMPORT_CONTACTS.md`

## Production Reality

Before touching production, verify these live paths and settings first:

- VPS backend code: ` /root/eximhub-platform/api `
- VPS project root: ` /root/eximhub-platform `
- Live website files: ` /var/www/eximhub-web `
- Live admin files: ` /var/www/eximhub-admin `
- PM2 API process: ` eximhub-api~ `
- Production database name: ` eximhub_db `

Important production notes learned the hard way:

- The live API is currently served through `https://eximhub.pro/api`, not `https://api.eximhub.pro`.
- The nginx config is in ` /etc/nginx/sites-available/eximhub `.
- The nginx `location /api/` block must use `proxy_pass http://127.0.0.1:5000;` without a trailing slash, otherwise `/api/*` routes are forwarded incorrectly and Express returns `Route not found`.
- Frontend production builds must therefore use `VITE_API_BASE_URL=https://eximhub.pro/api`.
- Backend `.env` on VPS was initially incomplete. Production auth/data scripts depend on DB variables being present in ` /root/eximhub-platform/api/.env `.
- Production schema was created from ` /root/eximhub-platform/database/schema.sql ` using the MySQL CLI after Node-based setup failed on missing DB credentials.

## Working Rule

If you finish meaningful work, update `HANDOFF.md` so the next person can continue without guessing.
