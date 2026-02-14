const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'form.html');
let html = fs.readFileSync(formPath, 'utf8');

// Yetişkin Moderate section'ını bul
const moderateStart = html.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Moderate Package -->');
const moderateEnd = html.indexOf('<!-- Detaylı Form Bölümleri - Yetişkin Comprehensive Package -->', moderateStart + 1);

if (moderateStart === -1 || moderateEnd === -1) {
    console.error('Yetişkin Moderate section bulunamadı!');
    process.exit(1);
}

// Moderate section içindeki mandibular bölümünü bul
const moderateSection = html.substring(moderateStart, moderateEnd);

// Mandibular checkbox'ını bul
const mandibularCheckbox = '<input type="checkbox" name="mandibular_ilerletme">';
const mandibularStart = moderateSection.indexOf(mandibularCheckbox);

if (mandibularStart === -1) {
    console.log('Yetişkin Moderate\'de mandibular ilerletme bulunamadı, zaten silinmiş olabilir.');
    process.exit(0);
}

console.log('Mandibular başlangıç pozisyonu:', mandibularStart);

// Checkbox'dan önceki <label> etiketini bul
const labelStart = moderateSection.lastIndexOf('<label class="checkbox-item">', mandibularStart);

console.log('Label başlangıç pozisyonu:', labelStart);

// Mandibular bölümünün bitişini bul - ortognatik cerrahi label'ına kadar
const nextCheckboxMarker = '<input type="checkbox" name="ortognatik_cerrahi">';
const nextCheckboxPos = moderateSection.indexOf(nextCheckboxMarker, mandibularStart);

if (nextCheckboxPos === -1) {
    console.error('Ortognatik cerrahi checkbox bulunamadı!');
    process.exit(1);
}

// Ortognatik'ten önceki label başlangıcını bul
const nextLabelStart = moderateSection.lastIndexOf('<label class="checkbox-item">', nextCheckboxPos);

console.log('Bir sonraki label başlangıç pozisyonu:', nextLabelStart);

console.log('Bir sonraki label başlangıç pozisyonu:', nextLabelStart);

// Silinecek kısmı çıkar (mandibular label'dan ortognatik label'a kadar)
const beforeMandibular = moderateSection.substring(0, labelStart);
const afterMandibular = moderateSection.substring(nextLabelStart);

const newModerateSection = beforeMandibular + afterMandibular;

// Yeni section'ı yerine koy
html = html.substring(0, moderateStart) + newModerateSection + html.substring(moderateEnd);

// Dosyayı kaydet
fs.writeFileSync(formPath, html, 'utf8');

console.log('✅ Yetişkin Moderate\'den Mandibular ilerletme başarıyla silindi!');
console.log('📍 Yetişkin Comprehensive ve Ergen Comprehensive\'deki mandibular korundu');
