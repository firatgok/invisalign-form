const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'form.html');
let html = fs.readFileSync(formPath, 'utf8');

// Ergen Comprehensive section'ını bul (satır 1611'den başlıyor)
const ergenCompStart = html.indexOf('<!-- Detaylı Form Bölümleri - Ergen Comprehensive Package -->');
const ergenCompEnd = html.indexOf('<!-- Tedavi Seçenekleri - Çocuk > Invisalign Palatal Genişleticiler -->');

if (ergenCompStart === -1 || ergenCompEnd === -1) {
    console.error('Ergen Comprehensive section bulunamadı!');
    process.exit(1);
}

// Ergen Comprehensive section'ını al
let ergenCompSection = html.substring(ergenCompStart, ergenCompEnd);

// Ergen Moderate için dönüştür
let ergenModerateSection = ergenCompSection
    // Comment başlığını değiştir
    .replace(
        '<!-- Detaylı Form Bölümleri - Ergen Comprehensive Package -->',
        '<!-- Detaylı Form Bölümleri - Ergen Moderate Package -->'
    )
    // Section ID'sini değiştir
    .replace(
        'id="detayli_form_ergen_comprehensive"',
        'id="detayli_form_ergen_moderate"'
    )
    // H2 başlığını değiştir
    .replace(
        '<h2>Tedavi Detayları - Comprehensive Package</h2>',
        '<h2>Tedavi Detayları - Moderate Package</h2>'
    );

// Yetişkin Moderate'in hemen önüne ekle
const insertPosition = html.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->');

if (insertPosition === -1) {
    console.error('Yetişkin Moderate section bulunamadı!');
    process.exit(1);
}

// Yeni section'ı ekle
html = html.substring(0, insertPosition) + ergenModerateSection + '\n            ' + html.substring(insertPosition);

// Dosyayı kaydet
fs.writeFileSync(formPath, html, 'utf8');

console.log('✅ Ergen Moderate Package başarıyla oluşturuldu!');
console.log('📍 Yetişkin Moderate\'in hemen önüne eklendi');
