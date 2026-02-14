const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'form.html');
let html = fs.readFileSync(formPath, 'utf8');

// Her formu tanımla
const forms = [
    {
        startMarker: '<!-- Detaylı Form Bölümleri - Yetişkin Comprehensive Package -->',
        endMarker: '<!-- Detaylı Form Bölümleri - Ergen Comprehensive Package -->',
        suffix: '_yetiskin_comp',
        name: 'Yetişkin Comprehensive'
    },
    {
        startMarker: '<!-- Detaylı Form Bölümleri - Ergen Comprehensive Package -->',
        endMarker: '<!-- Detaylı Form Bölümleri - Ergen Moderate Package -->',
        suffix: '_ergen_comp',
        name: 'Ergen Comprehensive'
    },
    {
        startMarker: '<!-- Detaylı Form Bölümleri - Ergen Moderate Package -->',
        endMarker: '<!-- Detaylı Form Bölümleri - Çocuk First Comprehensive Package -->',
        suffix: '_ergen_moderate',
        name: 'Ergen Moderate'
    },
    {
        startMarker: '<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->',
        endMarker: '<!-- Detaylı Form Bölümleri - Yetişkin Comprehensive Package -->',
        suffix: '_yetiskin_moderate',
        name: 'Yetişkin Moderate'
    }
];

forms.forEach(form => {
    const startPos = html.indexOf(form.startMarker);
    if (startPos === -1) {
        console.log(`⚠ ${form.name} bulunamadı, atlanıyor`);
        return;
    }
    
    const endPos = html.indexOf(form.endMarker, startPos + 1);
    if (endPos === -1) {
        console.log(`⚠ ${form.name} bitiş marker'ı bulunamadı, atlanıyor`);
        return;
    }
    
    let section = html.substring(startPos, endPos);
    const originalLength = section.length;
    
    // Name attribute'larını bul
    const namePattern = /name="([^"]+)"/g;
    let matches = [];
    let match;
    
    while ((match = namePattern.exec(section)) !== null) {
        const originalName = match[1];
        // Zaten suffix yoksa ekle
        if (!originalName.includes('_yetiskin_') && 
            !originalName.includes('_ergen_') && 
            !originalName.includes('_cocuk_')) {
            matches.push(originalName);
        }
    }
    
    const uniqueNames = [...new Set(matches)];
    
    if (uniqueNames.length === 0) {
        console.log(`✓ ${form.name}: Zaten unique name'ler mevcut`);
        return;
    }
    
    // Her name için replacement yap
    uniqueNames.forEach(originalName => {
        const newName = originalName + form.suffix;
        const regex = new RegExp(`name="${originalName}"`, 'g');
        section = section.replace(regex, `name="${newName}"`);
    });
    
    console.log(`✓ ${form.name}: ${uniqueNames.length} name güncellendi (${originalLength} → ${section.length} karakter)`);
    
    // HTML'i güncelle
    html = html.substring(0, startPos) + section + html.substring(endPos);
});

// Kaydet
fs.writeFileSync(formPath, html, 'utf8');

console.log('\n✅ Tüm formların name attribute\'ları unique yapıldı!');
console.log('📝 Her form artık bağımsız çalışacak');
