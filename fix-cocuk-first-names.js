const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'form.html');
let html = fs.readFileSync(formPath, 'utf8');

// Çocuk First section'ını bul
const cocukFirstStart = html.indexOf('<!-- Detaylı Form Bölümleri - Çocuk First Comprehensive Package -->');
const cocukFirstEnd = html.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->', cocukFirstStart + 1);

if (cocukFirstStart === -1 || cocukFirstEnd === -1) {
    console.error('Çocuk First section bulunamadı!');
    process.exit(1);
}

let cocukFirstSection = html.substring(cocukFirstStart, cocukFirstEnd);
const originalLength = cocukFirstSection.length;

// Tüm name attribute'larına _cocuk_first suffix ekle
// Önce input/select/textarea name'lerini bul ve değiştir
const namePattern = /name="([^"]+)"/g;
let matches = [];
let match;

while ((match = namePattern.exec(cocukFirstSection)) !== null) {
    const originalName = match[1];
    // Zaten _cocuk_first ile bitmiyorsa ekle
    if (!originalName.endsWith('_cocuk_first') && !originalName.includes('_cocuk_first')) {
        matches.push(originalName);
    }
}

// Unique name'leri al
const uniqueNames = [...new Set(matches)];
console.log(`${uniqueNames.length} farklı name bulundu`);

// Her name için replacement yap
uniqueNames.forEach(originalName => {
    const newName = originalName + '_cocuk_first';
    // Global replace - tüm örnekleri değiştir
    const regex = new RegExp(`name="${originalName}"`, 'g');
    cocukFirstSection = cocukFirstSection.replace(regex, `name="${newName}"`);
});

console.log(`✓ Tüm name attribute'lar güncellendi`);
console.log(`Önceki uzunluk: ${originalLength}, Yeni uzunluk: ${cocukFirstSection.length}`);

// HTML'i güncelle
html = html.substring(0, cocukFirstStart) + cocukFirstSection + html.substring(cocukFirstEnd);

// Kaydet
fs.writeFileSync(formPath, html, 'utf8');

console.log('✅ Çocuk First form name attribute\'ları unique yapıldı!');
console.log('📝 Tüm input/select/textarea name\'lerine _cocuk_first suffix eklendi');
