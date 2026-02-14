const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'form.html');
let html = fs.readFileSync(formPath, 'utf8');

// Ergen Moderate section'ını bul
const ergenModerateStart = html.indexOf('<!-- Detaylı Form Bölümleri - Ergen Moderate Package -->');
const ergenModerateEnd = html.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->', ergenModerateStart + 1);

if (ergenModerateStart === -1 || ergenModerateEnd === -1) {
    console.error('Ergen Moderate section bulunamadı!');
    process.exit(1);
}

console.log('Ergen Moderate Start:', ergenModerateStart);
console.log('Ergen Moderate End:', ergenModerateEnd);

const ergenModerateSection = html.substring(ergenModerateStart, ergenModerateEnd);

// Mandibular checkbox'ını bul
const mandCheckbox = '<input type="checkbox" name="mandibular_ilerletme">';
const mandPos = ergenModerateSection.indexOf(mandCheckbox);

if (mandPos === -1) {
    console.log('✓ Ergen Moderate\'de mandibular ilerletme yok, zaten temiz.');
    process.exit(0);
}

console.log('Mandibular pozisyonu Ergen Moderate içinde:', mandPos);

// Label başlangıcını bul
const labelStart = ergenModerateSection.lastIndexOf('<label class="checkbox-item">', mandPos);

// Ortognatik cerrahi'ye kadar sil
const ortognatikCheckbox = '<input type="checkbox" name="ortognatik_cerrahi">';
const ortognatikPos = ergenModerateSection.indexOf(ortognatikCheckbox, mandPos);
const ortognatikLabelStart = ergenModerateSection.lastIndexOf('<label class="checkbox-item">', ortognatikPos);

console.log('Silinecek bölge:', labelStart, '-', ortognatikLabelStart);

// Yeni section oluştur
const newErgenModerateSection = 
    ergenModerateSection.substring(0, labelStart) + 
    ergenModerateSection.substring(ortognatikLabelStart);

// HTML'i güncelle
html = html.substring(0, ergenModerateStart) + newErgenModerateSection + html.substring(ergenModerateEnd);

// Kaydet
fs.writeFileSync(formPath, html, 'utf8');

console.log('✅ Ergen Moderate\'den Mandibular ilerletme başarıyla silindi!');
