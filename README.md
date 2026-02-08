# Invisalign Form Yazılımı

Web tabanlı Invisalign tedavi formu uygulaması. Doktorların hızlıca tedavi detaylarını girmesini ve PDF çıktısı almasını sağlar.

## 🚀 Özellikler

- ✅ **Tam Kapsamlı Form**: 12 bölümlük detaylı Comprehensive Package formu
- ✅ **Dinamik Seçimler**: Hasta tipi, ürün ve tedavi seçeneklerine göre otomatik form görünürlüğü
- ✅ **Akıllı Kontroller**: A-P ilişkisi, mandibular ilerletme, overbite/overjet otomatik kontrolleri
- ✅ **PDF Oluşturma**: HTML2Canvas ile screenshot + kopyalanabilir özel talimatlar
- ✅ **Auto-resize Textarea**: Özel talimatlar alanı içeriğe göre otomatik büyür
- ✅ **Kopyala Butonu**: Özel talimatları tek tıkla panoya kopyalama
- ✅ **Responsive Tasarım**: Farklı ekran boyutlarına uyumlu
- ✅ **Netlify Ready**: Netlify'a deploy edilmeye hazır

## 📋 Teknolojiler

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF Generation**: jsPDF v2.5.1, html2canvas v1.4.1
- **Deployment**: Netlify
- **Version Control**: Git

## 🛠️ Kurulum

### Yerel Çalıştırma

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/KULLANICI_ADINIZ/invisalign-form.git
cd invisalign-form
```

2. **Dosyaları bir web sunucusuyla açın:**

**Seçenek 1 - VS Code Live Server:**
- VS Code'da projeyi açın
- `index.html` dosyasına sağ tıklayın
- "Open with Live Server" seçin

**Seçenek 2 - Python Simple Server:**
```bash
python -m http.server 8000
# Tarayıcıda: http://localhost:8000
```

**Seçenek 3 - Node.js http-server:**
```bash
npx http-server
```

### Netlify'a Deploy

1. Netlify'a giriş yapın
2. "Add new site" > "Import an existing project"
3. GitHub reponuzu seçin
4. Deploy! (netlify.toml otomatik algılanır)

## 📖 Kullanım

1. **Hasta Bilgileri**: Hasta adı, soyadı, MI
2. **Hasta Tipi**: Yetişkin/Ergen/Çocuk seçin
3. **Ürün Tipi**: Invisalign/Vivera/diğer ürünleri seçin
4. **Tedavi Seçeneği**: Comprehensive/Moderate/Lite/Express
5. **Detaylı Form**: 12 bölümlük tedavi detaylarını doldurun
6. **Özel Talimatlar**: İngilizce talimatlarınızı yazın (auto-resize)
7. **PDF Oluştur**: Butona tıklayarak PDF indirin

## 📁 Proje Yapısı

```
invisalign-form/
├── index.html          # Ana form sayfası
├── styles.css          # Tüm stiller
├── script.js           # Form logic + PDF generation
├── netlify.toml        # Netlify config
├── README.md           # Proje dokümantasyonu
└── .gitignore          # Git ignore dosyası
```

## 🔧 Geliştirme

### Yeni Özellik Ekleme

1. Branch oluşturun: `git checkout -b feature/yeni-ozellik`
2. Değişikliklerinizi yapın
3. Commit edin: `git commit -m "Yeni özellik: ..."`
4. Push edin: `git push origin feature/yeni-ozellik`
5. Pull Request açın

### Form Bölümleri

- **Hasta Tipi Kontrolleri**: `showProductSection()`
- **Tedavi Seçenekleri**: `showTreatmentSection()`
- **Detaylı Form**: `showDetailedForm()`
- **A-P Kontrolleri**: `setupAPControls()`
- **Overbite Kontrolleri**: `setupOverbiteControls()`
- **PDF Generation**: `generatePDF()`

## 📝 TODO

- [ ] Ergen ve Çocuk detaylı formları
- [ ] Moderate/Lite/Express detaylı formları
- [ ] Çoklu dil desteği
- [ ] Form verilerini localStorage'a kaydetme
- [ ] Form validasyonu iyileştirmeleri

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun
3. Commit edin
4. Push edin
5. Pull Request açın

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👨‍⚕️ Kullanım Alanı

Invisalign tedavisi sunan diş hekimleri için tasarlanmıştır. Form, tedavi planlamasını hızlandırır ve asistanlarla paylaşılabilir PDF çıktıları sağlar.
