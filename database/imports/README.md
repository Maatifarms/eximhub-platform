This folder stores import-ready data snapshots for local setup and search indexing.

Current dataset:

- `eximhub-contacts.csv`: source contact dataset used by `api/import_contacts_csv.js`

Import command from `eximhub-platform/api`:

```powershell
npm.cmd run import:contacts -- --file "..\database\imports\eximhub-contacts.csv"
```
