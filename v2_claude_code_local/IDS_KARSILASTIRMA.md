# IDS (Invisalign Doctor Site) ile Form Karşılaştırması

Kaynak: vip.invisalign.com, deneme hastası "DENEME, TEST" (yetişkin, 01/01/1990), 2 Ekim 2026.
Geleneksel Reçete (traditional Rx) akışı incelendi. Flex Rx ayrıca eklenecek, en sona bırakıldı.

## Genel akış (IDS)

Hasta Verisi → Klinik Koşullar → Hasta Portresi → Tara → Fotoğraflar → Radyograf → Hasta dosyası →
"Reçeteyi gönder / Başla" → Hasta tipi → Ürün tipi → Tedavi seçenekleri → Rx formu (adımlar) → Tara → Fotoğraflar → Radyograf → İndirim → Özet → Sevk

Kullanıcı kararları:
- Klinik Koşullar ve Genel Notlar: forma GİRMEYECEK.
- Hasta Portresi, Fotoğraflar, Radyograf: forma GİRMEYECEK (asistan yükler).
- Tara: formda KALACAK. "Daha sonra karar ver" seçeneği GİRMEYECEK. CBCT Tara kutusu EKLENDİ.

## Hasta tipi / Ürün tipi (Yetişkin)

- Hasta tipi: Yetişkinim / Ergenler / Çocuk → bizimle aynı.
- Yetişkin ürün: Invisalign şeffaf alignerlar / Vivera Retainerları / Invisalign Gülümseme Mimarisi → bizimle aynı.
- Yetişkin aligner paketleri: Comprehensive (3 yıl 3 set ₺65400 / 5 yıl sınırsız ₺73300), Moderate (₺57100), Lite (çift ark ₺45000 / tek ark ₺34400), Express (çift ark ₺25500 / tek ark ₺19500).
  - Comprehensive kartında "Tedavi özellikleri": Oklüzal bloklu MA ₺4000, Gelişmiş hassas kanatlı MA ek ücret yok.
- Vivera Retainer: tek seçenek "3 set retainer" (çift ark ₺8700 / tek ark ₺5500).

## Yetişkin Comprehensive — Geleneksel Rx, 10 adım

| Adım | Bölüm | Bizim formla fark |
|---|---|---|
| 1 | 1. Tedavi edilecek ark | IDS'te Üst/Alt altındaki karşıt ark seçenekleri **radio** (tek seçim), ark seçilene kadar pasif, Üst/Alt seçilince "hiçbir şey yoktur" otomatik işaretli. Bizde checkbox. |
| 2 | 2. Diş hareketi sınırlamaları + 3. Ataşmanlar | Aynı. Izgaralar seçim yapılana kadar pasif, "Tümünü seç" var. |
| 3 | 4. A-P İlişkisi | Diş hareketi / Mandibular ilerletme / Ortognatik cerrahi **radio grubu** (bizde checkbox + manuel dışlama). Kurallar aşağıda. |
| 4 | 5. Overjet | Aynı (3 seçenek). |
| 5 | 6. Overbite | Aynı yapı. Kural: Üst veya Alt işaretliyse Diğer pasif; **Diğer işaretliyse Üst ve Alt pasif** (bizde eksik). |
| 6 | 7. Bite Ramp | Aynı. Alt seçenekler gizlenmiyor, pasif gösteriliyor. |
| 7 | 8. Orta hat + 9. Posterior Çapraz Kapanış | Aynı. |
| 8 | 10. Boşluk ve Çapraşıklık | Boşluk: "Tüm boşlukları kapat" / "Belli boşluklar bırak" + "Belli boşlukları düzenle" bağlantısı (diş aralarına mm girilen 30 kutuluk ızgara). Bizde 3. seçenek "düzenle" radio olarak var, ızgara yok. **IPR varsayılanları IDS'te "Hiçbiri"** (Genişlet ve Procline "Gerektiği gibi"). Bizde hepsi "gerektiğinde". |
| 9 | 10. devam — Diş çekimleri | Aynı (Hiçbiri / Bu dişleri çek + 32 diş). Ankraj notu metni var. |
| 10 | 11. Özel Talimatlar | Aynı, 4000 karakter. |
| Tara | Tarama | İntraoral / PVS, iTero kodu + Ara, "Önceki taramayı göster", **"İntraoral tarama mevcut değilse" kutusu (bizde yok)**, CBCT Tara (PVS seçilince "PVS ölçüleri ile birlikte kullanılamaz" ve pasif). |

### A-P kuralları (IDS'te ölçüldü)

| Sağ + Sol | Diş hareketi | Posterior IPR | Sınıf II/III | Distalizasyon | MA | Ortognatik |
|---|---|---|---|---|---|---|
| mevcut + mevcut | pasif | pasif | pasif | pasif | pasif | pasif |
| kanin + mevcut, kanin + kanin | otomatik seçili | aktif | **pasif** | aktif | aktif | **pasif** |
| köpekdişi veya Sınıf I herhangi bir tarafta (kanin ile karışık dahil) | otomatik seçili | aktif | aktif | aktif | aktif | aktif |

- Posterior IPR / Sınıf II/III / Distalizasyon yalnızca "Diş hareketi seçenekleri" seçiliyken aktif.
- Sınıf II/III işaretlenince Precision Cuts Evet/Hayır aktif; Distalizasyon işaretlenince kendi Evet/Hayır'ı aktif.
- MA seçilince MA alt seçenekleri (özellik, final pozisyon, aşamalandırma, alt ark asimetrik, dikey elastikler) görünür; varsayılanlar: gelişmiş hassas kanatlar, baş başa, ikişer mm, kaydırma, hayır.

## Yetişkin Moderate — farklar (Comprehensive'e göre)

- Adım 1: "Karşıt arkta pasif alignerlar (Not: çift ark ücreti uygulanır)".
- A-P tablosu 3 satır: Mevcut / Yalnızca Kanin / "Köpekdişi ve azıdişi ilişkisini kısmi olarak 3 mm'ye kadar iyileştir". **Sınıf I satırı yok.**
- A-P seçenekleri: Diş hareketi (Posterior IPR, Sınıf II/III + precision, Distalizasyon + precision), Ortognatik cerrahi. **Mandibular ilerletme yok.**
- Diğer adımlar Comprehensive ile aynı (10 adım).

## Yetişkin Lite — farklar

- A-P tablosu 3 satır: Mevcut / Yalnızca Kanin / "Kanin ve molar ilişkisini kısmi olarak 2 mm'ye kadar iyileştir".
- A-P seçenekleri: Diş hareketi → yalnızca Posterior IPR ve Sınıf II/III (+precision). Distalizasyon, MA, Ortognatik yok.
- Overjet + Overbite aynı adımda. Overbite basitleştirilmiş: Hizalama / İlk koru / "Açık kapanışı iyileştirin - Özel Talimatlarda belirtin" / "Derin kapanışı iyileştirin - ön dişleri intrüze et" (+ Üst / Alt kutuları).
- **Posterior Çapraz Kapanış bölümü yok.**
- Boşluk ve Çapraşıklık + diş çekimleri var.
- Toplam 10 adım (numaralar: 9 Boşluk, 10 Özel Talimatlar).

## Yetişkin Express — farklar

- **A-P bölümü yok.**
- Overjet + Overbite (Lite ile aynı basit hali).
- Bite Ramp, Orta hat var. Posterior Çapraz Kapanış yok.
- Boşluk ve Çapraşıklık var ama **diş çekimleri adımı yok**.
- 9 adım (9 Özel Talimatlar).

## Yetişkin Vivera Retainer — 6 adım (bizde form yok)

1. Tedavi edilecek ark: Her ikisi / Üst / Alt.
2. Kurulum Talimatları (üst ve alt ark ayrı): yeni ölçü/tarama kullan (önerilen) / son ClinCheck planındaki son aktif aşama / ClinCheck'ten aşama numarası (açılır liste) / önceki retainer siparişindeki arkı kullan.
3. Pontikler: otomatik / belirtilen boşluklara (32 diş ızgarası).
4. Sabit lingual retainer: yok / var → koru ve kapla / koru ve etrafını kontürle / sanal olarak çıkar.
5. Isırma destekleri: Hiçbiri / yerleştir → Kesici dişler (santral, lateral) / Kaninler.
6. İnterproksimal temasların sıkıştırılması (üst ve alt ayrı): sıkılaştırma / Power Chain / Virtual C-chain.
Sonra: Tara, İndirim, Özet, Şartlar, Sevk.

## Ergen (2. deneme hastası "DENEMEIKI, TEST")

- Ürünler: Invisalign şeffaf alignerlar / Vivera Retainerları / Invisalign Palatal Genişleticiler → bizimle aynı.
- Paketler ve fiyatlar yetişkinle birebir aynı (Comprehensive / Moderate / Lite / Express).
- **Her ergen formu = aynı yetişkin formu + ek "Erupsiyon kompansasyonu" bölümü** (Özel Talimatlar ile aynı adımda):
  - Erupsiyon kompansasyonu: Hiçbiri / Şu dişler için ekle → 1.5 1.4 1.3 | 2.3 2.4 2.5 ve 4.5 4.4 4.3 | 3.3 3.4 3.5
  - Terminal azıdişi tablaları: Hiçbiri / Şu dişlere ekle → 1.8 1.7 1.6 | 2.6 2.7 2.8 ve 4.8 4.7 4.6 | 3.6 3.7 3.8
  - "Terminal azıdişi tablalarını başlatma aşaması" metin kutusu
- Ergen Comprehensive: 11 adım (11 Erupsiyon + 12 Özel Talimatlar aynı adımda), Tara'da CBCT var.
- Ergen Moderate: yetişkin Moderate + Erupsiyon (A-P 3 satır, MA yok).
- Ergen Lite: yetişkin Lite + Erupsiyon (10 Erupsiyon, 11 Özel Talimatlar).
- Ergen Express: yetişkin Express + Erupsiyon (9 Erupsiyon, 10 Özel Talimatlar).
- Lite ve Express'in Tara adımında CBCT yok.

## Çocuk - Invisalign First

- Ürünler: Invisalign First şeffaf alignerlar / Vivera / Palatal → bizimle aynı.
- Tek paket: "Invisalign First - Comprehensive Package" (çift ark ₺42100 / tek ark ₺35000). Faz 2 indirimi notu var.
- Seçilince **uygunluk uyarısı** çıkıyor: "hastaların kalıcı kesicilerinin en az 2/3'ü ... ark başına en az iki kesici diş çıkmış olmalı. Çift ark: en az 3 çeyrekte en az 2 süt dişi (C, D veya E) veya çıkmamış kalıcı diş (3, 4 veya 5). Tek ark: aynı, 3 çeyrekte 2 süt dişi (C, D veya E) veya çıkmamış kalıcı diş (2, 4 veya 5)."
- Form farkları (Comprehensive'e göre):
  - 1. Ark: karşıt ark seçenekleri yalnızca "hiçbir şey yoktur" ve "tanı modeli" (pasif alignerlar YOK).
  - 2./3. Diş ızgaraları **süt dişlerini içeriyor** (5.5–5.1, 6.1–6.5, 8.5–8.1, 7.1–7.5): 52 diş. Diş çekimi ızgarası da 52 diş.
  - 4. A-P satırları: Mevcut / **Yalnızca azıdişi ilişkisini iyileştir** / Köpekdişi ve azıdişi ilişkisini iyileştir / Sınıf I'e düzeltim. MA ve ortognatik var.
  - 7. Bite Ramp: **"Hiçbiri" (varsayılan) / Lingual rampler** — "otomatik" seçeneği yok.
  - 9. Posterior Çapraz Kapanış: varsayılan **"Düzelt"**.
  - 11. Erupsiyon: diş listesi daha geniş: 1.5 1.4 1.3 1.2 1.1 | 2.1 2.2 2.3 2.4 2.5 ve 4.5 4.4 4.3 4.2 4.1 | 3.1 3.2 3.3 3.4 3.5. Terminal listesi ergenle aynı.
  - Tara'da CBCT yok.

## Flex Rx (üst düzey)

Şablon tabanlı form; çoğu ayar hekimin Klinik Tercihler şablonundan geliyor. Sayfa bölümleri:
- Tercihler: "Dr. ... Klinik Tercihler Şablonu" (Görünüm / Şablonu düzenle)
- Vakaya özel klinik tercihler (isteğe bağlı): sol menü → IPR; Maloklüzyon düzeltmesi (Çapraşıklık, Boşluk, Orta hat, Anterior-Posterior düzeltme, Çapraz kapanış); Anterior düzeltmesi (Anterior seviyeleme, Overbite); Plak özellikleri; Boşluk kapatma için aşırı düzeltme; Pasif/aktif plaklar. Her başlık şablonu geçersiz kılma paneli açıyor.
- Tedavi edilecek ark (açılır liste, varsayılan Her ikisi de)
- Sınırlamalar, ekstraksiyonlar ve eksik dişler: sekmeler Diş Hareketi / Ataşmanlar / Diş çekimleri / Eksik dişler
- Özel Notlar
- "Reçeteyi tamamla" düğmesi
Ayrıntılı panel içerikleri incelenmedi; hekimin şablonuna bağlı olduğu için ayrıca ele alınacak.

## Atlananlar (kullanıcı kararı)

- Yetişkin Gülümseme Mimarisi, Vivera (çocuk/ergen), Palatal genişleticiler.
- Ek Hizalayıcılar akışı deneme hastasında açılamaz (aktif tedavi gerekir).
- "Belli boşlukları düzenle" bağlantısı otomasyonla açılamadı (muhtemelen ayrı pencere).

## Uygulanan değişiklikler (2 Ekim 2026)

1. ✅ Tüm formlar: karşıt ark seçenekleri radio (`ust_karsit_ark_<form>` / `alt_karsit_ark_<form>`); Üst/Alt seçilince "hiçbir şey yoktur" otomatik. Eski kayıtlardaki checkbox anahtarları görüntülemede radio'ya çevriliyor.
2. ✅ Tüm formlar: Tarama'ya "İntraoral tarama mevcut değilse" kutusu (`intraoral_tarama_yok_<form>`).
3. ✅ Tüm formlar: Çapraşıklık IPR satırlarının varsayılanı "Hiçbiri".
4. ✅ A-P kuralı: köpekdişi/Sınıf I varsa hepsi açık (kanin ile karışık dahil).
5. ✅ Overbite: Diğer işaretliyse Üst/Alt pasif.
6. ✅ Moderate (yetişkin, ergen): A-P 3 satır, 3. satır "kısmi olarak 3 mm'ye kadar".
7. ✅ Çocuk First: süt dişleri (52 diş) üç ızgarada, A-P 2. satır "Yalnızca azıdişi", bite ramp Hiçbiri/Lingual, posterior çapraz varsayılan Düzelt, karşıt arkta pasif aligner yok, erupsiyon kesicileri eklendi, uygunluk notu.
8. ✅ Yeni formlar: `detayli_form_yetiskin_lite`, `detayli_form_yetiskin_express`, `detayli_form_ergen_lite`, `detayli_form_ergen_express` (Moderate'ten türetildi; Lite/Express paketleri artık aktif).
9. ⏳ Flex Rx: ayrı aşama (hekimin Klinik Tercihler şablonuna bağlı).

Yapılmayanlar: "Belli boşlukları düzenle" mm ızgarası (IDS'te açılamadı), Gülümseme Mimarisi / Vivera / Palatal formları (kullanıcı kararı).

Not: IDS'te "DENEMEIKI, TEST" deneme hastası ve üzerinde Comprehensive (Flex) reçete taslağı duruyor; arşivlenmeli.
