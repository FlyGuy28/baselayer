const fs = require('fs');
const csv = require('csv-parser');

const inputPath = 'openbeautyfacts.csv';
const outputPath = 'filtered_ingredients.csv';
const writeStream = fs.createWriteStream(outputPath);

// This "Set" will remember every barcode we've already saved
const seenBarcodes = new Set();

writeStream.write('product_name,ingredients_text,barcode\n');

console.log('--- Deep Scan & De-Duplication Starting ---');

let rowCount = 0;
let savedCount = 0;
let duplicateCount = 0;

fs.createReadStream(inputPath)
  .pipe(csv({ 
    separator: '\t', 
    quote: '', 
    strict: false 
  }))
  .on('data', (row) => {
    rowCount++;

    const name = row.product_name || row.product_name_en || row['product_name'] || 'Unknown';
    const ingredients = row.ingredients_text || row.ingredients_text_en || row['ingredients_text'] || '';
    const barcode = (row.code || row.barcode || row['code'] || '').trim();

    // 1. Check if we have ingredients
    if (ingredients && ingredients.trim().length > 3) {
      
      // 2. Check for duplicates using the Barcode
      if (barcode && seenBarcodes.has(barcode)) {
        duplicateCount++;
        return; // Skip this row, we already have it!
      }

      // 3. Clean and Save
      const cleanName = `"${name.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`;
      const cleanIngredients = `"${ingredients.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`;
      const cleanBarcode = `"${barcode.replace(/"/g, '')}"`;

      writeStream.write(`${cleanName},${cleanIngredients},${cleanBarcode}\n`);
      
      // Add this barcode to our "Memory"
      if (barcode) seenBarcodes.add(barcode);
      savedCount++;
    }

    if (rowCount % 10000 === 0) console.log(`Scanned ${rowCount} rows...`);
  })
  .on('end', () => {
    console.log('\n--- Final Clean Results ---');
    console.log(`Total Rows Scanned:  ${rowCount}`);
    console.log(`Unique Products Saved: ${savedCount}`);
    console.log(`Duplicates Removed:    ${duplicateCount}`);
    console.log(`File: ${outputPath} is ready!`);
  });