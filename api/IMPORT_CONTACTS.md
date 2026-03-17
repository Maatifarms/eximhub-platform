# Importing EximHub Contacts CSV

This project now includes a real CSV importer for customer search data.

## What it loads

The importer reads a CSV with these columns:

- `First_name`
- `Last_name`
- `Title`
- `Linkedin`
- `Email`
- `Phone`
- `Company_name`
- `Website`
- `Industry`
- `Country`

It writes data into:

- `companies`
- `contacts`

This is the data used by the search endpoint in `routes/discovery.js`.

## Commands

From `eximhub-platform/api`:

```powershell
npm.cmd run setup-db
```

Dry run first:

```powershell
npm.cmd run import:contacts -- --file "C:\Users\My Laptop\Downloads\Eximhub Contacts.csv" --dry-run
```

Real import:

```powershell
npm.cmd run import:contacts -- --file "C:\Users\My Laptop\Downloads\Eximhub Contacts.csv"
```

## Requirements

- MySQL must be running
- `.env` must contain the correct DB settings
- The schema must be created before import

## Notes

- Companies are deduplicated primarily by `company_name + website`, with a fallback to `company_name + country`
- Contacts are deduplicated by `email`, then `linkedin`, then `company_id + full_name + title`
- Procurement-style titles are marked using the same keyword logic as the platform
