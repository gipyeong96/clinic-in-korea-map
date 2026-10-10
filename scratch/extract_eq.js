const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/merged_clinics.json', 'utf8'));
const eqCount = {};

data.forEach(clinic => {
  if (clinic.public_equipment) {
    clinic.public_equipment.forEach(eq => {
      eqCount[eq] = (eqCount[eq] || 0) + 1;
    });
  }
});

// Sort by frequency
const sortedEq = Object.entries(eqCount).sort((a, b) => b[1] - a[1]);

console.log("Total unique equipment types found:", sortedEq.length);
console.log("Equipment List (by frequency):");
sortedEq.forEach(([eq, count]) => {
  console.log(`- ${eq} : ${count} clinics`);
});
