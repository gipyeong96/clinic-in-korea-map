const XLSX = require('xlsx');
const fs = require('fs');

const files = fs.readdirSync('./data');
const file3 = files.find(f => f.includes('01_시설정보') || f.includes('01_시설정보'));
const file7 = files.find(f => f.includes('05_의료장비정보') || f.includes('05_의료장비정보'));

function printSample(filename) {
    if (!filename) return;
    const wb = XLSX.readFile(`./data/${filename}`, {sheetRows: 5});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`\n--- ${filename} ---`);
    console.log("Columns:", Object.keys(data[0] || {}));
    console.log("Sample:", data[0]);
}

printSample(file3);
printSample(file7);
