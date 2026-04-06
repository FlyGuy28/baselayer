const fs = require('fs');
const csv = require('csv-parser');

// We test both comma and tab just in case
const inputPath = 'openbeautyfacts.csv'; 

fs.createReadStream(inputPath)
  .pipe(csv({ separator: '\t' })) // OpenBeautyFacts is usually tab-separated
  .on('headers', (headers) => {
    console.log('✅ Headers found in your file:');
    console.log(headers);
    process.exit();
  });