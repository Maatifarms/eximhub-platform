const path = require('path');
require('dotenv').config();
const { importMarketIntelligenceCsv } = require('./import_market_intelligence_lib');

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const fileArg = getArgValue('--file');
  const dryRun = process.argv.includes('--dry-run');
  const defaultFile = path.resolve(__dirname, '..', '..', 'market_intelligence', 'master', 'eximhub_market_intelligence_master.csv');
  const filePath = fileArg ? path.resolve(fileArg) : defaultFile;

  if (!filePath) {
    throw new Error('CSV file path is required.');
  }

  const summary = await importMarketIntelligenceCsv(filePath, { dryRun });
  if (dryRun) {
    console.log('Dry run completed. No database changes were made.');
  } else {
    console.log('Market intelligence import committed successfully.');
  }
  console.log('Summary:');
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error('MARKET_INTELLIGENCE_IMPORT_ERROR:', error);
    process.exitCode = 1;
  });
}

module.exports = { main };
