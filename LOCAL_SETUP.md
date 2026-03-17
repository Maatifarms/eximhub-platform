# EximHub Local Setup

## Environment

API:

1. Copy `api/.env.example` to `api/.env`
2. Fill in the database credentials if they differ from your local defaults

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

## Admin upload flow

The admin panel upload tab now uses the same importer as the CLI path.

Use an `Admin` or `Enterprise` account, open the Bulk Ingestion tab, choose a CSV, and start the import.
