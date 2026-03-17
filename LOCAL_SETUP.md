# EximHub Local Setup

## Environment

API:

1. Copy `api/.env.example` to `api/.env`
2. Fill in the database credentials if they differ from your local defaults
3. For automated signup and contact emails, also configure:
   - `FRONTEND_BASE_URL`
   - `SALES_EMAIL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`

Admin panel:

1. Copy `admin_panel/.env.example` to `admin_panel/.env`
2. Set `VITE_API_BASE_URL` if your API is not running on `http://127.0.0.1:5000/api`

## One-command local startup

From `eximhub-platform`:

```powershell
.\start_local.ps1
```

This script:

- starts MySQL if needed
- verifies the schema
- starts the API

To also start the web app:

```powershell
.\start_local.ps1 -SkipWeb:$false
```

## Contact import

Dry run:

```powershell
cd api
npm.cmd run import:contacts -- --file "C:\Users\My Laptop\Downloads\Eximhub Contacts.csv" --dry-run
```

Real import:

```powershell
cd api
npm.cmd run import:contacts -- --file "C:\Users\My Laptop\Downloads\Eximhub Contacts.csv"
```

## Full SQL snapshot

Export the exact current database state:

```powershell
.\database\export_db.ps1
```

Restore the checked-in SQL snapshot:

```powershell
.\database\import_db.ps1
```

This snapshot includes schema, triggers, and row data so the database can be reproduced more directly than a CSV-only import.

## Admin upload flow

The admin panel upload tab now supports:

- Contacts CSV ingestion (`/api/admin/upload/contacts`)
- Incremental market-intelligence CSV ingestion (`/api/admin/upload/market-intelligence`)

Use an `Admin` or `Enterprise` account, open the Bulk Ingestion tab, choose a CSV, and start the import.

## Public trust pages and contact flow

The web app now includes:

- `/contact` for direct inquiry capture
- `/privacy` for the privacy policy
- `/refund-policy` for the refund policy

Contact form submissions are stored in `contact_inquiries` and can trigger email notifications once SMTP is configured.
