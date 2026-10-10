const XLSX = require('xlsx');
const fs = require('fs');

const files = fs.readdirSync('./data');
const targetFile = files.find(f => f.includes('03_진료과목정보') || f.includes('03_진료과목정보'));

const workbook = XLSX.readFile(`./data/${targetFile}`, {sheetRows: 5});
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);
console.log("Columns:", Object.keys(data[0] || {}));
console.log("First 2 rows:", data.slice(0, 2));
