const fs = require('fs');
const html = fs.readFileSync('form.html', 'utf8');

const moderatePos = html.indexOf('Detaylı Form Bölümleri - Yetişkin Moderate');
console.log('Yetişkin Moderate position:', moderatePos);

const mandPos = [54043, 121485, 200501];
mandPos.forEach((p, i) => {
    console.log(`Mandibular ${i+1}: ${p} - Moderate'den ${p > moderatePos ? 'sonra' : 'önce'}`);
});

// Yetişkin Moderate'in bitiş pozisyonu
const moderateEndPos = html.indexOf('Detaylı Form Bölümleri - Yetişkin Comprehensive', moderatePos + 1);
console.log('Yetişkin Moderate end position:', moderateEndPos);

mandPos.forEach((p, i) => {
    if (p > moderatePos && p < moderateEndPos) {
        console.log(`\n✓ Mandibular ${i+1} Yetişkin Moderate içinde!`);
    }
});
