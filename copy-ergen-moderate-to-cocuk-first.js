const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'form.html');
let html = fs.readFileSync(formPath, 'utf8');

// Ergen Moderate section'ını bul
const ergenModerateStart = html.indexOf('<!-- Detaylı Form Bölümleri - Ergen Moderate Package -->');
const ergenModerateEnd = html.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->', ergenModerateStart + 1);

if (ergenModerateStart === -1 || ergenModerateEnd === -1) {
    console.error('Ergen Moderate section bulunamadı!');
    console.log('Start:', ergenModerateStart, 'End:', ergenModerateEnd);
    process.exit(1);
}

console.log('✓ Ergen Moderate bulundu:', ergenModerateStart, '-', ergenModerateEnd);

// Ergen Moderate section'ını al
let ergenModerateSection = html.substring(ergenModerateStart, ergenModerateEnd);

// Çocuk First için dönüştür
let cocukFirstSection = ergenModerateSection
    // Comment başlığını değiştir
    .replace(
        '<!-- Detaylı Form Bölümleri - Ergen Moderate Package -->',
        '<!-- Detaylı Form Bölümleri - Çocuk First Comprehensive Package -->'
    )
    // Section ID'sini değiştir
    .replace(
        'id="detayli_form_ergen_moderate"',
        'id="detayli_form_cocuk_first"'
    )
    // H2 başlığını değiştir
    .replace(
        '<h2>Tedavi Detayları - Moderate Package</h2>',
        '<h2>Tedavi Detayları - First Comprehensive Package</h2>'
    )
    // Patient info'yu değiştir
    .replace(
        '<p class="patient-info">Hasta Tipi: <strong>Ergen</strong></p>',
        '<p class="patient-info">Hasta Tipi: <strong>Çocuk</strong></p>'
    );

console.log('✓ Çocuk First section oluşturuldu, uzunluk:', cocukFirstSection.length);

// Yetişkin Moderate'in hemen önüne ekle
const insertPosition = html.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->');

if (insertPosition === -1) {
    console.error('Yetişkin Moderate section bulunamadı!');
    process.exit(1);
}

console.log('✓ Insert pozisyonu bulundu:', insertPosition);

// Yeni section'ı ekle
html = html.substring(0, insertPosition) + cocukFirstSection + '\n\n            ' + html.substring(insertPosition);

// Dosyayı kaydet
fs.writeFileSync(formPath, html, 'utf8');

console.log('✅ Çocuk First Comprehensive Package başarıyla oluşturuldu!');
console.log('📍 Yetişkin Moderate\'in hemen önüne eklendi');
console.log('📝 Not: Diş çekimi ve ataşman kısımları daha sonra modifiye edilebilir');
