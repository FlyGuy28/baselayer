const fs = require('fs');
const path = require('path');

try {
    const csvFilePath = path.join(__dirname, 'cosing.csv');
    
    if (!fs.existsSync(csvFilePath)) {
        console.error("❌ Error: I can't find 'cosing.csv' in the main folder.");
        process.exit(1);
    }

    console.log("Reading cosing.csv... this might take a second.");
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const rows = csvData.split('\n');
    
    const jsonResult = rows.slice(1).map(row => {
        const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (values && values.length >= 2) {
            return {
                name: values[0].replace(/"/g, '').trim(),
                func: values[1].replace(/"/g, '').trim()
            };
        }
        return null;
    }).filter(Boolean);

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    fs.writeFileSync(path.join(dataDir, 'cosing_master.json'), JSON.stringify(jsonResult, null, 2));
    console.log(`✅ SUCCESS! Your app now knows ${jsonResult.length} ingredients.`);
} catch (err) {
    console.error("❌ An error occurred during conversion:", err.message);
}