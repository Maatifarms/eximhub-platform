# EximHub Handoff Notes

## How To Use This File

Update this file at the end of any meaningful work session.

Keep notes short and practical:
- what changed
- what is working
- what is blocked
- what should happen next

## Current Snapshot

### Working Areas

- web app
- API
- admin panel
- data import workflows
- market intelligence integration
- auth system

### In Progress

- homepage/mobile polish
- mobile app launch and Android emulator testing

### Recent Important Notes

- Public trust pages and visible contact details were added.
- Contact form and email flow structure were added.
- Market intelligence import/search is integrated.
- Mobile app required fixes to align Expo entry, AsyncStorage session handling, and Android build dependencies.
- March 18, 2026: imported `C:\Users\My Laptop\Downloads\Master Data of all countries.csv` into local MySQL through the contacts importer.
- March 18, 2026: discovery now uses the imported company/contact dataset with filters for country, company name, industry, keyword, and result limit.
- March 18, 2026: repeat contact results are blocked per user using `reveals`, so previously revealed contacts should not be returned again to the same user.
- March 18, 2026: public self-signup is disabled; new users are intended to be created by admin.
- March 18, 2026: admin panel now includes a Users tab backed by `/api/admin/create-user` and `/api/admin/users`.
- March 18, 2026: importer now sanitizes invalid website values from CSVs, and `companies.website` is stored as `TEXT`.
- March 18, 2026: added extra indexes for contacts/reveals and removed `ORDER BY RAND()` from discovery so search remains responsive as more data is deployed.
- March 18, 2026: local API was restarted after backend changes and `/api/health` verified successfully.
- March 19, 2026: web login now supports Google Identity Services on the frontend and `/api/auth/google` now verifies Google ID tokens on the backend, auto-linking existing users by email and auto-creating new trial users when needed.
- March 19, 2026: contact inquiries now store IP/location/user-agent plus lightweight lead scoring and summary fields; notification emails to `rupesh2510@gmail.com` include those details.
- March 19, 2026: added `/api/site/visit` plus `website_visits` capture for meaningful website visitors, with rule-first lead scoring and optional OpenAI enrichment when `OPENAI_API_KEY` is configured.
- March 19, 2026: added `web/.env.example` for `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`; API `.env.example` now also documents the optional OpenAI settings.
- March 20, 2026: production VPS layout was identified. Backend code lives in ` /root/eximhub-platform/api `, frontend static files in ` /var/www/eximhub-web `, admin static files in ` /var/www/eximhub-admin `, and PM2 runs the API as `eximhub-api~`.
- March 20, 2026: production database `eximhub_db` initially existed without schema; tables were created successfully by importing ` /root/eximhub-platform/database/schema.sql ` through the MySQL CLI.
- March 20, 2026: production contacts import from ` /master data Countries (1).csv ` completed successfully with `57,879` contacts inserted and `57,764` procurement contacts detected.
- March 20, 2026: production API health was confirmed working at `https://eximhub.pro/api/health`.
- March 20, 2026: production nginx proxy bug was found and fixed. `location /api/` must use `proxy_pass http://127.0.0.1:5000;` without a trailing slash. With a trailing slash, `/api/health` was incorrectly forwarded as `/health` and returned `Route not found`.
- March 20, 2026: frontend must target `https://eximhub.pro/api` as `VITE_API_BASE_URL`. Using `https://api.eximhub.pro` is incorrect for the current production nginx layout and also triggered certificate mismatch confusion.
- March 20, 2026: a production app DB user `eximhub_app` with password auth was introduced because Node scripts could not rely on local root socket auth.
- March 20, 2026: user-facing auth is still incomplete. `/api/health` works, but browser login still needs final end-to-end verification. Continue by checking `/api/auth/login` directly, confirming the deployed frontend bundle is current, and then re-testing email login before touching Google sign-in again.
- March 20, 2026: the SSH private key used during troubleshooting was exposed in chat and must be rotated immediately.

## Mobile Status

- Android emulator setup exists locally.
- Backend API can be run locally for mobile testing.
- Mobile build work has progressed, but Android launch should always be re-verified before calling it complete.

## Next Recommended Steps

1. Rotate the compromised SSH key before any further production work.
2. Verify `/api/auth/login` directly against production, then verify the same request from the browser Network tab.
3. Confirm the latest frontend build is actually uploaded to ` /var/www/eximhub-web ` before debugging browser auth further.
4. Validate one email login end to end before spending more time on Google sign-in.
5. After email login works, verify admin panel data loading and user creation/points allocation flows.
6. Re-test Google sign-in only after normal login is stable.

## Session Update Template

Date:

Changed:

Verified:

Blocked:

Next:
