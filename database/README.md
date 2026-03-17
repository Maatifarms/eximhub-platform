## Database Snapshots

Use these scripts to export and import the full MySQL database state, including schema, trigger definitions, and row data.

### Export current database state

From `eximhub-platform`:

```powershell
.\database\export_db.ps1
```

This writes the snapshot to:

```text
database/exports/eximhub_db.sql
```

### Import a checked-in snapshot

From `eximhub-platform`:

```powershell
.\database\import_db.ps1
```

Both scripts read connection settings from `api/.env` by default.

### Current checked-in data artifacts

- `database/imports/eximhub-contacts.csv`: raw importable contacts dataset
- `database/exports/eximhub_db.sql`: full SQL snapshot of the local database state
