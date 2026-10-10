const XLSX = require('xlsx');
const workbook = XLSX.readFile('../data/1.병원정보서비스(2026.6.).xlsx', {sheetRows: 5});
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);
console.log("Columns:", Object.keys(data[0] || {}));
console.log("First 2 rows:", data.slice(0, 2));
