const fs = require('fs');

// Read form.html
let content = fs.readFileSync('form.html', 'utf8');

// Find yetişkin comprehensive section
const yetiskinCompStart = content.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Comprehensive Package -->');
const yetiskinCompEnd = content.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->');

if (yetiskinCompStart === -1 || yetiskinCompEnd === -1) {
    console.log('Yetişkin comprehensive bölümü bulunamadı!');
    process.exit(1);
}

// Extract yetişkin comprehensive section
let yetiskinComp = content.slice(yetiskinCompStart, yetiskinCompEnd);

// Create ergen comprehensive by replacing text
let ergenComp = yetiskinComp
    .replace(/<!-- Detaylı Form Bölümleri - Yetişkin Comprehensive Package -->/g, '<!-- Detaylı Form Bölümleri - Ergen Comprehensive Package -->')
    .replace(/id="detayli_form_yetiskin_comprehensive"/g, 'id="detayli_form_ergen_comprehensive"')
    .replace(/Tedavi Detayları - Comprehensive Package/g, 'Tedavi Detayları - Comprehensive Package')
    .replace(/<p class="patient-info">Hasta Tipi: <strong>Yetişkinim<\/strong><\/p>/g, '<p class="patient-info">Hasta Tipi: <strong>Ergen</strong></p>');

// Find where to insert (right after yetişkin comprehensive, before moderate)
const insertPosition = yetiskinCompEnd;

// Insert ergen comprehensive
content = content.slice(0, insertPosition) + '\n' + ergenComp + content.slice(insertPosition);

// Write back
fs.writeFileSync('form.html', content, 'utf8');
console.log('✓ Ergen Comprehensive paketi oluşturuldu (Yetişkin Comprehensive\'den kopyalandı)');
