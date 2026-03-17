const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { importContactsCsv } = require('./import_contacts_lib');

function parseArgs(argv) {
  const args = { dryRun: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file' && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.file) {
    throw new Error('Missing --file argument. Example: npm run import:contacts -- --file "C:\\path\\to\\Eximhub Contacts.csv"');
  }

  const filePath = path.resolve(args.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const summary = await importContactsCsv(filePath, { dryRun: args.dryRun });

  if (args.dryRun) {
    console.log('Dry run completed. No database changes were made.');
  } else {
    console.log('Import committed successfully.');
  }

  console.log('Summary:');
  console.log(JSON.stringify(summary, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error.message);
    process.exit(1);
  });
