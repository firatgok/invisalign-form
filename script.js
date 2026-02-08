// Form verilerini topla
function collectFormData() {
    const formData = {};
    
    // Tüm input elementlerini topla
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (input.checked) {
                if (!formData[input.name]) {
                    formData[input.name] = [];
                }
                formData[input.name].push(input.value);
            }
        } else if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else {
            formData[input.name] = input.value;
        }
    });
    
    return formData;
}

// PDF oluştur (ekran görüntüsü olarak)
async function generatePDF() {
    // PDF butonu ve form butonlarını gizle
    const pdfButton = document.getElementById('pdfBtn');
    const resetButton = document.getElementById('resetBtn');
    if (pdfButton) pdfButton.style.display = 'none';
    if (resetButton) resetButton.style.display = 'none';
    
    // Hasta adı bilgisini al
    const hastaSoyadi = document.querySelector('input[name="hasta_soyadi"]')?.value || 'hasta';
    const hastaAdi = document.querySelector('input[name="hasta_adi"]')?.value || '';
    const fileName = `invisalign_form_${hastaSoyadi}_${hastaAdi}_${new Date().getTime()}.pdf`;
    
    // Loading mesajı göster
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; text-align: center;';
    loadingDiv.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #667eea;">PDF Oluşturuluyor...</h3><p style="margin: 0; color: #666;">Lütfen bekleyin</p>';
    document.body.appendChild(loadingDiv);
    
    try {
        // Sayfayı en üste scroll et
        window.scrollTo(0, 0);
        
        // Kısa bir bekleme süresi ekle (render için)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Özel talimatlar textarea'sını bul
        const ozelTalimatlarTextarea = document.getElementById('ozel_talimatlar_textarea');
        const ozelTalimatlarText = ozelTalimatlarTextarea?.value || '';
        const textareaOriginalValue = ozelTalimatlarTextarea?.value || '';
        
        // Form container'ını al
        const formContainer = document.querySelector('.container') || document.body;
        
        // Textarea'nın pozisyonunu ve boyutunu kaydet (PDF'de text overlay için)
        let textareaRect = null;
        let containerRect = null;
        let originalHeight = '';
        let originalOpacity = '';
        
        if (ozelTalimatlarTextarea) {
            containerRect = formContainer.getBoundingClientRect();
            textareaRect = ozelTalimatlarTextarea.getBoundingClientRect();
            originalHeight = ozelTalimatlarTextarea.style.height;
            originalOpacity = ozelTalimatlarTextarea.style.opacity;
            
            // Textarea'yı tamamen görünmez yap (screenshot'ta görünmesin)
            ozelTalimatlarTextarea.style.opacity = '0';
            ozelTalimatlarTextarea.style.pointerEvents = 'none';
        }
        
        // Render için kısa bekle
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // html2canvas ile sayfanın ekran görüntüsünü al
        const canvas = await html2canvas(formContainer, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            logging: true,
            backgroundColor: '#ffffff',
            windowWidth: formContainer.scrollWidth,
            windowHeight: formContainer.scrollHeight
        });
        
        // Textarea'yı restore et
        if (ozelTalimatlarTextarea) {
            ozelTalimatlarTextarea.style.opacity = originalOpacity || '1';
            ozelTalimatlarTextarea.style.pointerEvents = 'auto';
        }
        
        // ESKİ KOD - Artık kullanmıyoruz
        if (false && ozelTalimatlarSection) {
            ozelTalimatlarSection.style.display = originalDisplay;
        }
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        
        // Canvas boyutlarını al - daha fazla içerik sığdırmak için
        const imgWidth = 190; // Kenar boşluğu bırakarak 190mm
        const pageHeight = 277; // A4 yüksekliği (kenar boşluğu ile)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10; // Üstten 10mm boşluk
        
        // PDF oluştur
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // İlk sayfayı ekle
        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Eğer içerik birden fazla sayfaya sığmıyorsa, sayfa ekle
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Eğer özel talimatlar varsa, textarea alanının üzerine kopyalanabilir text ekle
        if (ozelTalimatlarText && ozelTalimatlarText.trim() && textareaRect && containerRect) {
            // Textarea'nın container içindeki relative pozisyonunu hesapla
            const textareaRelativeTop = textareaRect.top - containerRect.top + window.pageYOffset;
            const textareaRelativeLeft = textareaRect.left - containerRect.left;
            
            // PDF koordinatlarına çevir
            const pdfX = 10 + (textareaRelativeLeft * imgWidth / containerRect.width);
            const pdfY = (textareaRelativeTop * imgHeight / containerRect.height);
            const pdfTextWidth = (textareaRect.width * imgWidth / containerRect.width) - 8; // 8mm padding (left+right)
            
            // Hangi sayfada olduğunu bul
            const textareaPage = Math.floor(pdfY / pageHeight);
            let textareaYInPage = pdfY - (textareaPage * pageHeight) + 10; // Container'dan 10mm offset
            
            // O sayfaya git
            let totalPages = doc.internal.getNumberOfPages();
            let currentPage = textareaPage < totalPages ? textareaPage + 1 : totalPages;
            doc.setPage(currentPage);
            
            // Text ayarları
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            // Text'i satırlara böl (textarea genişliğine göre)
            const lines = doc.splitTextToSize(ozelTalimatlarText, pdfTextWidth);
            const lineHeight = 5.5;
            let currentY = textareaYInPage + 5; // 5mm top padding
            
            // Tüm satırları yazdır - sayfa geçişlerini yönet
            for (let i = 0; i < lines.length; i++) {
                // Sayfa sonu kontrolü
                if (currentY > pageHeight - 15) {
                    // Yeni sayfaya geç
                    currentPage++;
                    if (currentPage > totalPages) {
                        doc.addPage();
                        totalPages++;
                    } else {
                        doc.setPage(currentPage);
                    }
                    // Y pozisyonunu sıfırla - yeni sayfada textarea pozisyonuna dön
                    currentY = 20; // Yeni sayfada üstten başla
                    // Text ayarlarını tekrar uygula (sayfa değişince resetlenir)
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(0, 0, 0);
                }
                
                // Satırı yazdır - textarea genişliği içinde
                doc.text(lines[i], pdfX + 4, currentY); // 4mm left padding
                currentY += lineHeight;
            }
        }
        
        // BONUS: Ayrı sayfaya da tam metni ekle (yedek ve tam metin için)
        if (ozelTalimatlarText && ozelTalimatlarText.trim()) {
            doc.addPage();
            
            // Başlık ekle
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(51, 51, 51);
            doc.text('11. Özel Talimatlar (Lütfen özel talimatlarınızı İngilizce yazmaya dikkat ediniz)', 15, 20);
            
            // Kopyalanabilir not ekle
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text('📋 Bu metin seçilebilir ve kopyalanabilir', 15, 27);
            
            // Ayırıcı çizgi
            doc.setDrawColor(200, 200, 200);
            doc.line(15, 25, 195, 25);
            
            // Metni ekle (kopyalanabilir)
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 51, 51);
            
            const lines = doc.splitTextToSize(ozelTalimatlarText, 180);
            let yPos = 35;
            
            lines.forEach(line => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                }
                doc.text(line, 15, yPos);
                yPos += 6;
            });
        }
        
        // PDF'i kaydet
        doc.save(fileName);
        
        // Loading mesajını kaldır ve butonları geri göster
        document.body.removeChild(loadingDiv);
        if (pdfButton) pdfButton.style.display = 'inline-block';
        if (resetButton) resetButton.style.display = 'inline-block';
        
        alert('PDF başarıyla oluşturuldu!');
    } catch (error) {
        console.error('PDF oluşturma hatası:', error);
        document.body.removeChild(loadingDiv);
        if (pdfButton) pdfButton.style.display = 'inline-block';
        if (resetButton) resetButton.style.display = 'inline-block';
        alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// Formu temizle
function resetForm() {
    if (confirm('Formu temizlemek istediğinizden emin misiniz?')) {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }
}

// Hasta tipi seçimine göre ürün tipini göster
function showProductSection() {
    const hastaTipiInputs = document.querySelectorAll('input[name="hasta_tipi"]');
    
    hastaTipiInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Tüm ürün bölümlerini gizle
            document.querySelectorAll('.product-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Tüm tedavi bölümlerini gizle
            document.querySelectorAll('.treatment-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Seçilen hasta tipine göre ürün bölümünü göster
            if (this.value === 'yetiskin') {
                document.getElementById('urun_yetiskin').style.display = 'block';
            } else if (this.value === 'ergen') {
                const ergenSection = document.getElementById('urun_ergen');
                if (ergenSection) ergenSection.style.display = 'block';
            } else if (this.value === 'cocuk') {
                const cocukSection = document.getElementById('urun_cocuk');
                if (cocukSection) cocukSection.style.display = 'block';
            }
        });
    });
}

// Ürün tipi seçimine göre tedavi seçeneklerini göster
function showTreatmentSection() {
    // Yetişkin ürün tipleri
    const urunTipiYetiskinInputs = document.querySelectorAll('input[name="urun_tipi_yetiskin"]');
    urunTipiYetiskinInputs.forEach(input => {
        input.addEventListener('change', function() {
            document.querySelectorAll('.treatment-section').forEach(section => {
                section.style.display = 'none';
            });
            
            if (this.value === 'invisalign_aligner') {
                document.getElementById('tedavi_yetiskin_invisalign').style.display = 'block';
            } else if (this.value === 'vivera_retainer') {
                document.getElementById('tedavi_yetiskin_vivera').style.display = 'block';
            } else if (this.value === 'gulumseme_mimarisi') {
                const gulSection = document.getElementById('tedavi_yetiskin_gulumseme');
                if (gulSection) gulSection.style.display = 'block';
            }
        });
    });
    
    // Ergen ürün tipleri
    const urunTipiErgenInputs = document.querySelectorAll('input[name="urun_tipi_ergen"]');
    urunTipiErgenInputs.forEach(input => {
        input.addEventListener('change', function() {
            document.querySelectorAll('.treatment-section').forEach(section => {
                section.style.display = 'none';
            });
            
            if (this.value === 'invisalign_aligner') {
                const ergenTedaviSection = document.getElementById('tedavi_ergen_invisalign');
                if (ergenTedaviSection) ergenTedaviSection.style.display = 'block';
            } else if (this.value === 'vivera_retainer') {
                const ergenViveraSection = document.getElementById('tedavi_ergen_vivera');
                if (ergenViveraSection) ergenViveraSection.style.display = 'block';
            } else if (this.value === 'palatal_genisletici') {
                const palatalSection = document.getElementById('tedavi_ergen_palatal');
                if (palatalSection) palatalSection.style.display = 'block';
            }
        });
    });
    
    // Çocuk ürün tipleri
    const urunTipiCocukInputs = document.querySelectorAll('input[name="urun_tipi_cocuk"]');
    urunTipiCocukInputs.forEach(input => {
        input.addEventListener('change', function() {
            document.querySelectorAll('.treatment-section').forEach(section => {
                section.style.display = 'none';
            });
            
            if (this.value === 'invisalign_first') {
                const cocukFirstSection = document.getElementById('tedavi_cocuk_first');
                if (cocukFirstSection) cocukFirstSection.style.display = 'block';
            } else if (this.value === 'vivera_retainer') {
                const cocukViveraSection = document.getElementById('tedavi_cocuk_vivera');
                if (cocukViveraSection) cocukViveraSection.style.display = 'block';
            } else if (this.value === 'palatal_genisletici') {
                const cocukPalatalSection = document.getElementById('tedavi_cocuk_palatal');
                if (cocukPalatalSection) cocukPalatalSection.style.display = 'block';
            }
        });
    });
}

// Tedavi paketi seçildiğinde detaylı form göster
function showDetailedForm() {
    // Yetişkin comprehensive paketi
    const yetiskinComprehensive = document.querySelector('input[name="tedavi_secenegi"][value="comprehensive"]');
    if (yetiskinComprehensive) {
        yetiskinComprehensive.addEventListener('change', function() {
            if (this.checked) {
                const detayliForm = document.getElementById('detayli_form_yetiskin_comprehensive');
                if (detayliForm) {
                    detayliForm.style.display = 'block';
                    // Forma scroll yap
                    setTimeout(() => {
                        detayliForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // A-P ilişkisi kontrollerini başlat
                        setupAPControls();
                        // Sub-option kontrollerini başlat
                        setupSubOptionControls();
                        // Karşılıklı dışlayan seçenekleri ayarla
                        setupMutuallyExclusiveOptions();
                        // Overbite kontrollerini başlat
                        setupOverbiteControls();
                        // Bite Ramp kontrollerini başlat
                        setupBiteRampControls();
                        // Orta hat kontrollerini başlat
                        setupOrtaHatControls();
                        // Diş çekimi kontrollerini başlat
                        setupDisCekimiControls();
                        // Textarea auto-resize'ı başlat
                        setupTextareaAutoResize();
                    }, 100);
                }
            }
        });
    }
}

// A-P İlişkisi kontrollerini ayarla
function setupAPControls() {
    const apSagRadios = document.querySelectorAll('input[name="ap_sag"]');
    const apSolRadios = document.querySelectorAll('input[name="ap_sol"]');
    
    // Kontrol edilecek elementler
    const disHareketiCheckbox = document.querySelector('input[name="dis_hareketi_secenekleri"]');
    const posteriorIPRCheckbox = document.querySelector('input[name="posterior_ipr"]');
    const sinif23Checkbox = document.querySelector('input[name="sinif_2_3_duzeltme"]');
    const distalizasyonCheckbox = document.querySelector('input[name="distalizasyon_checkbox"]');
    const mandibularCheckbox = document.querySelector('input[name="mandibular_ilerletme"]');
    const ortognatikCheckbox = document.querySelector('input[name="ortognatik_cerrahi"]');
    
    function updateControlStates() {
        // Seçili değerleri al
        const sagValue = document.querySelector('input[name="ap_sag"]:checked')?.value;
        const solValue = document.querySelector('input[name="ap_sol"]:checked')?.value;
        
        // Her ikisi de "mevcut" ise - HEPSİNİ PASİF YAP
        if (sagValue === 'mevcut' && solValue === 'mevcut') {
            if (disHareketiCheckbox) {
                disHareketiCheckbox.disabled = true;
                disHareketiCheckbox.checked = false;
            }
            if (posteriorIPRCheckbox) {
                posteriorIPRCheckbox.disabled = true;
                posteriorIPRCheckbox.checked = false;
            }
            if (sinif23Checkbox) {
                sinif23Checkbox.disabled = true;
                sinif23Checkbox.checked = false;
            }
            if (distalizasyonCheckbox) {
                distalizasyonCheckbox.disabled = true;
                distalizasyonCheckbox.checked = false;
            }
            if (mandibularCheckbox) {
                mandibularCheckbox.disabled = true;
                mandibularCheckbox.checked = false;
            }
            if (ortognatikCheckbox) {
                ortognatikCheckbox.disabled = true;
                ortognatikCheckbox.checked = false;
            }
        }
        // Sağ veya sol "kanin" ise - Posterior IPR, Distalizasyon ve Mandibular aktif + DİŞ HAREKETİ OTOMATİK
        else if (sagValue === 'kanin' || solValue === 'kanin') {
            if (disHareketiCheckbox) {
                disHareketiCheckbox.disabled = false;
                disHareketiCheckbox.checked = true; // Otomatik işaretle
                // Diğer karşılıklı dışlanan seçenekleri temizle
                clearMutuallyExclusiveOptions('dis_hareketi');
            }
            if (posteriorIPRCheckbox) posteriorIPRCheckbox.disabled = false;
            if (sinif23Checkbox) sinif23Checkbox.disabled = true;
            if (distalizasyonCheckbox) distalizasyonCheckbox.disabled = false;
            if (mandibularCheckbox) mandibularCheckbox.disabled = false;
            if (ortognatikCheckbox) ortognatikCheckbox.disabled = true;
        }
        // Köpekdişi/azıdışı veya Sınıf I seçiliyse - HEPSİ AKTİF VE DİŞ HAREKETİ OTOMATİK İŞARETLİ
        else if (sagValue === 'kopekdisi_azidisi' || solValue === 'kopekdisi_azidisi' ||
                 sagValue === 'sinif_1' || solValue === 'sinif_1') {
            if (disHareketiCheckbox) {
                disHareketiCheckbox.disabled = false;
                disHareketiCheckbox.checked = true; // Otomatik işaretle
                // Diğer karşılıklı dışlanan seçenekleri temizle
                clearMutuallyExclusiveOptions('dis_hareketi');
            }
            if (posteriorIPRCheckbox) posteriorIPRCheckbox.disabled = false;
            if (sinif23Checkbox) sinif23Checkbox.disabled = false;
            if (distalizasyonCheckbox) distalizasyonCheckbox.disabled = false;
            if (mandibularCheckbox) mandibularCheckbox.disabled = false;
            if (ortognatikCheckbox) ortognatikCheckbox.disabled = false;
        }
    }
    
    // Tüm radio'lara event listener ekle
    apSagRadios.forEach(radio => {
        radio.addEventListener('change', updateControlStates);
    });
    
    apSolRadios.forEach(radio => {
        radio.addEventListener('change', updateControlStates);
    });
    
    // İlk yüklemede kontrol et
    updateControlStates();
}

// Sınıf II/III ve Distalizasyon checkbox kontrolü
function setupSubOptionControls() {
    const sinif23Checkbox = document.querySelector('input[name="sinif_2_3_duzeltme"]');
    const precisionCutsRadios = document.querySelectorAll('input[name="precision_cuts"]');
    const distalizasyonRadios = document.querySelectorAll('input[name="distalizasyon"]');
    
    if (sinif23Checkbox && precisionCutsRadios.length > 0) {
        sinif23Checkbox.addEventListener('change', function() {
            precisionCutsRadios.forEach(radio => {
                radio.disabled = !this.checked;
                if (!this.checked) {
                    radio.checked = false;
                }
            });
        });
        
        // İlk durumu ayarla
        precisionCutsRadios.forEach(radio => {
            radio.disabled = !sinif23Checkbox.checked;
        });
    }
    
    // Distalizasyon için ayrı kontrol
    // Distalizasyon checkbox'ını bul (eğer varsa)
    const distalizasyonParentCheckbox = document.querySelector('input[name="distalizasyon_checkbox"]');
    if (distalizasyonParentCheckbox && distalizasyonRadios.length > 0) {
        distalizasyonParentCheckbox.addEventListener('change', function() {
            distalizasyonRadios.forEach(radio => {
                radio.disabled = !this.checked;
                if (!this.checked) {
                    radio.checked = false;
                }
            });
        });
        
        // İlk durumu ayarla
        distalizasyonRadios.forEach(radio => {
            radio.disabled = !distalizasyonParentCheckbox.checked;
        });
    }
}

// Overbite kontrollerini ayarla
function setupOverbiteControls() {
    const acikKapanisRadio = document.querySelector('input[name="overbite"][value="acik_kapanis"]');
    const derinKapanisRadio = document.querySelector('input[name="overbite"][value="derin_kapanis"]');
    const hizalamaSonrasiRadio = document.querySelector('input[name="overbite"][value="hizalama_sonrasi"]');
    const ilkKoruRadio = document.querySelector('input[name="overbite"][value="ilk_koru"]');
    
    // Açık kapanış checkboxları
    const acikUstCheckbox = document.querySelector('input[name="acik_kapanis_ust"]');
    const acikAltCheckbox = document.querySelector('input[name="acik_kapanis_alt"]');
    const acikDigerCheckbox = document.querySelector('input[name="acik_kapanis_diger"]');
    const acikUstAnterior = document.querySelector('input[name="acik_kapanis_ust_anterior_ekstruzyon"]');
    const acikUstPosterior = document.querySelector('input[name="acik_kapanis_ust_posterior_intruzyon"]');
    const acikAltAnterior = document.querySelector('input[name="acik_kapanis_alt_anterior_ekstruzyon"]');
    const acikAltPosterior = document.querySelector('input[name="acik_kapanis_alt_posterior_intruzyon"]');
    
    // Derin kapanış checkboxları
    const derinUstCheckbox = document.querySelector('input[name="derin_kapanis_ust"]');
    const derinAltCheckbox = document.querySelector('input[name="derin_kapanis_alt"]');
    const derinDigerCheckbox = document.querySelector('input[name="derin_kapanis_diger"]');
    const derinUstAnterior = document.querySelector('input[name="derin_kapanis_ust_anterior_intruzyon"]');
    const derinUstPosterior = document.querySelector('input[name="derin_kapanis_ust_posterior_ekstruzyon"]');
    const derinAltAnterior = document.querySelector('input[name="derin_kapanis_alt_anterior_intruzyon"]');
    const derinAltPosterior = document.querySelector('input[name="derin_kapanis_alt_posterior_ekstruzyon"]');
    
    // Başlangıçta tüm alt seçenekleri pasif yap
    function disableAllOverbiteSubOptions() {
        [acikUstCheckbox, acikAltCheckbox, acikDigerCheckbox,
         acikUstAnterior, acikUstPosterior, acikAltAnterior, acikAltPosterior,
         derinUstCheckbox, derinAltCheckbox, derinDigerCheckbox,
         derinUstAnterior, derinUstPosterior, derinAltAnterior, derinAltPosterior].forEach(checkbox => {
            if (checkbox) {
                checkbox.disabled = true;
                checkbox.checked = false;
            }
        });
    }
    
    // İlk durumu ayarla
    disableAllOverbiteSubOptions();
    
    // Açık kapanış seçildiğinde
    if (acikKapanisRadio) {
        acikKapanisRadio.addEventListener('change', function() {
            if (this.checked) {
                disableAllOverbiteSubOptions();
                // Üst, Alt, Diğer checkboxlarını aktif et
                if (acikUstCheckbox) acikUstCheckbox.disabled = false;
                if (acikAltCheckbox) acikAltCheckbox.disabled = false;
                if (acikDigerCheckbox) acikDigerCheckbox.disabled = false;
            }
        });
    }
    
    // Derin kapanış seçildiğinde
    if (derinKapanisRadio) {
        derinKapanisRadio.addEventListener('change', function() {
            if (this.checked) {
                disableAllOverbiteSubOptions();
                // Üst, Alt, Diğer checkboxlarını aktif et
                if (derinUstCheckbox) derinUstCheckbox.disabled = false;
                if (derinAltCheckbox) derinAltCheckbox.disabled = false;
                if (derinDigerCheckbox) derinDigerCheckbox.disabled = false;
            }
        });
    }
    
    // Hizalama sonrası veya İlk koru seçildiğinde tüm alt seçenekleri pasif yap
    if (hizalamaSonrasiRadio) {
        hizalamaSonrasiRadio.addEventListener('change', function() {
            if (this.checked) disableAllOverbiteSubOptions();
        });
    }
    if (ilkKoruRadio) {
        ilkKoruRadio.addEventListener('change', function() {
            if (this.checked) disableAllOverbiteSubOptions();
        });
    }
    
    // Açık kapanış - Üst checkbox seçildiğinde alt seçeneklerini aktif et
    if (acikUstCheckbox) {
        acikUstCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (acikUstAnterior) acikUstAnterior.disabled = false;
                if (acikUstPosterior) acikUstPosterior.disabled = false;
                // Diğer checkbox'ı deaktif et
                if (acikDigerCheckbox) {
                    acikDigerCheckbox.disabled = true;
                    acikDigerCheckbox.checked = false;
                }
            } else {
                if (acikUstAnterior) {
                    acikUstAnterior.disabled = true;
                    acikUstAnterior.checked = false;
                }
                if (acikUstPosterior) {
                    acikUstPosterior.disabled = true;
                    acikUstPosterior.checked = false;
                }
                // Eğer Alt da seçili değilse, Diğer'i tekrar aktif et
                if (!acikAltCheckbox || !acikAltCheckbox.checked) {
                    if (acikDigerCheckbox) acikDigerCheckbox.disabled = false;
                }
            }
        });
    }
    
    // Açık kapanış - Alt checkbox seçildiğinde alt seçeneklerini aktif et
    if (acikAltCheckbox) {
        acikAltCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (acikAltAnterior) acikAltAnterior.disabled = false;
                if (acikAltPosterior) acikAltPosterior.disabled = false;
                // Diğer checkbox'ı deaktif et
                if (acikDigerCheckbox) {
                    acikDigerCheckbox.disabled = true;
                    acikDigerCheckbox.checked = false;
                }
            } else {
                if (acikAltAnterior) {
                    acikAltAnterior.disabled = true;
                    acikAltAnterior.checked = false;
                }
                if (acikAltPosterior) {
                    acikAltPosterior.disabled = true;
                    acikAltPosterior.checked = false;
                }
                // Eğer Üst de seçili değilse, Diğer'i tekrar aktif et
                if (!acikUstCheckbox || !acikUstCheckbox.checked) {
                    if (acikDigerCheckbox) acikDigerCheckbox.disabled = false;
                }
            }
        });
    }
    
    // Derin kapanış - Üst checkbox seçildiğinde alt seçeneklerini aktif et
    if (derinUstCheckbox) {
        derinUstCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (derinUstAnterior) derinUstAnterior.disabled = false;
                if (derinUstPosterior) derinUstPosterior.disabled = false;
                // Diğer checkbox'ı deaktif et
                if (derinDigerCheckbox) {
                    derinDigerCheckbox.disabled = true;
                    derinDigerCheckbox.checked = false;
                }
            } else {
                if (derinUstAnterior) {
                    derinUstAnterior.disabled = true;
                    derinUstAnterior.checked = false;
                }
                if (derinUstPosterior) {
                    derinUstPosterior.disabled = true;
                    derinUstPosterior.checked = false;
                }
                // Eğer Alt da seçili değilse, Diğer'i tekrar aktif et
                if (!derinAltCheckbox || !derinAltCheckbox.checked) {
                    if (derinDigerCheckbox) derinDigerCheckbox.disabled = false;
                }
            }
        });
    }
    
    // Derin kapanış - Alt checkbox seçildiğinde alt seçeneklerini aktif et
    if (derinAltCheckbox) {
        derinAltCheckbox.addEventListener('change', function() {
            if (this.checked) {
                if (derinAltAnterior) derinAltAnterior.disabled = false;
                if (derinAltPosterior) derinAltPosterior.disabled = false;
                // Diğer checkbox'ı deaktif et
                if (derinDigerCheckbox) {
                    derinDigerCheckbox.disabled = true;
                    derinDigerCheckbox.checked = false;
                }
            } else {
                if (derinAltAnterior) {
                    derinAltAnterior.disabled = true;
                    derinAltAnterior.checked = false;
                }
                if (derinAltPosterior) {
                    derinAltPosterior.disabled = true;
                    derinAltPosterior.checked = false;
                }
                // Eğer Üst de seçili değilse, Diğer'i tekrar aktif et
                if (!derinUstCheckbox || !derinUstCheckbox.checked) {
                    if (derinDigerCheckbox) derinDigerCheckbox.disabled = false;
                }
            }
        });
    }
}

// Bite Ramp kontrollerini ayarla
function setupBiteRampControls() {
    const lingualRamplerRadio = document.querySelector('input[name="bite_ramp"][value="lingual_rampler"]');
    const otomatikRadio = document.querySelector('input[name="bite_ramp"][value="otomatik"]');
    const hicbiriRadio = document.querySelector('input[name="bite_ramp"][value="hicbiri"]');
    const subOptionsDiv = document.getElementById('bite_ramp_sub_options');
    
    const kesiciDislerRadio = document.querySelector('input[name="bite_ramp_dis_tipi"][value="kesici_disler"]');
    const kaninlerRadio = document.querySelector('input[name="bite_ramp_dis_tipi"][value="kaninler"]');
    const kesiciDislerOptionsDiv = document.getElementById('kesici_disler_options');
    
    // Lingual Rampleri seçildiğinde alt seçenekleri göster
    if (lingualRamplerRadio && subOptionsDiv) {
        lingualRamplerRadio.addEventListener('change', function() {
            if (this.checked) {
                subOptionsDiv.style.display = 'block';
            }
        });
    }
    
    // Otomatik veya Hiçbiri seçildiğinde alt seçenekleri gizle
    if (otomatikRadio && subOptionsDiv) {
        otomatikRadio.addEventListener('change', function() {
            if (this.checked) {
                subOptionsDiv.style.display = 'none';
                if (kesiciDislerOptionsDiv) kesiciDislerOptionsDiv.style.display = 'none';
            }
        });
    }
    
    if (hicbiriRadio && subOptionsDiv) {
        hicbiriRadio.addEventListener('change', function() {
            if (this.checked) {
                subOptionsDiv.style.display = 'none';
                if (kesiciDislerOptionsDiv) kesiciDislerOptionsDiv.style.display = 'none';
            }
        });
    }
    
    // Kesici dişler seçildiğinde checkbox'ları göster
    if (kesiciDislerRadio && kesiciDislerOptionsDiv) {
        kesiciDislerRadio.addEventListener('change', function() {
            if (this.checked) {
                kesiciDislerOptionsDiv.style.display = 'block';
            }
        });
    }
    
    // Kaninler seçildiğinde checkbox'ları gizle
    if (kaninlerRadio && kesiciDislerOptionsDiv) {
        kaninlerRadio.addEventListener('change', function() {
            if (this.checked) {
                kesiciDislerOptionsDiv.style.display = 'none';
            }
        });
    }
}

// Orta hat kontrollerini ayarla
function setupOrtaHatControls() {
    const iprIyilestirRadio = document.querySelector('input[name="orta_hat"][value="ipr_iyilestir"]');
    const hizalamaSonrasiRadio = document.querySelector('input[name="orta_hat"][value="hizalama_sonrasi"]');
    const ilkKoruRadio = document.querySelector('input[name="orta_hat"][value="ilk_koru"]');
    
    const ustCheckbox = document.querySelector('input[name="orta_hat_ust"]');
    const altCheckbox = document.querySelector('input[name="orta_hat_alt"]');
    
    const ustYonRadios = document.querySelectorAll('input[name="orta_hat_ust_yon"]');
    const altYonRadios = document.querySelectorAll('input[name="orta_hat_alt_yon"]');
    
    // Başlangıçta tüm alt seçenekleri pasif yap
    function disableAllOrtaHatSubOptions() {
        if (ustCheckbox) {
            ustCheckbox.disabled = true;
            ustCheckbox.checked = false;
        }
        if (altCheckbox) {
            altCheckbox.disabled = true;
            altCheckbox.checked = false;
        }
        ustYonRadios.forEach(radio => {
            radio.disabled = true;
            radio.checked = false;
        });
        altYonRadios.forEach(radio => {
            radio.disabled = true;
            radio.checked = false;
        });
    }
    
    // İlk durumu ayarla
    disableAllOrtaHatSubOptions();
    
    // IPR ile iyileştir seçildiğinde Üst ve Alt checkbox'ları aktif et
    if (iprIyilestirRadio) {
        iprIyilestirRadio.addEventListener('change', function() {
            if (this.checked) {
                if (ustCheckbox) ustCheckbox.disabled = false;
                if (altCheckbox) altCheckbox.disabled = false;
            }
        });
    }
    
    // Hizalama sonrası veya İlk koru seçildiğinde tüm alt seçenekleri pasif yap
    if (hizalamaSonrasiRadio) {
        hizalamaSonrasiRadio.addEventListener('change', function() {
            if (this.checked) disableAllOrtaHatSubOptions();
        });
    }
    if (ilkKoruRadio) {
        ilkKoruRadio.addEventListener('change', function() {
            if (this.checked) disableAllOrtaHatSubOptions();
        });
    }
    
    // Üst checkbox seçildiğinde yön radio'larını aktif et
    if (ustCheckbox) {
        ustCheckbox.addEventListener('change', function() {
            ustYonRadios.forEach(radio => {
                radio.disabled = !this.checked;
                if (!this.checked) radio.checked = false;
            });
        });
    }
    
    // Alt checkbox seçildiğinde yön radio'larını aktif et
    if (altCheckbox) {
        altCheckbox.addEventListener('change', function() {
            altYonRadios.forEach(radio => {
                radio.disabled = !this.checked;
                if (!this.checked) radio.checked = false;
            });
        });
    }
}

// Textarea auto-resize - içerik arttıkça yükseklik otomatik artar
function setupTextareaAutoResize() {
    const textarea = document.getElementById('ozel_talimatlar_textarea');
    if (!textarea) return;
    
    function adjustHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
    }
    
    textarea.addEventListener('input', adjustHeight);
    // İlk yükleme için de ayarla
    adjustHeight();
}

// Özel talimatları yapıştır
function pasteOzelTalimatlar() {
    const textarea = document.getElementById('ozel_talimatlar_textarea');
    
    // Clipboard API kullan
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText()
            .then(text => {
                if (text && text.trim() !== '') {
                    textarea.value = text;
                    // Auto-resize trigger
                    textarea.dispatchEvent(new Event('input'));
                    
                    // Başarılı - buton metnini geçici değiştir
                    const btn = document.getElementById('paste_ozel_talimatlar_btn');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '✓ Yapıştırıldı!';
                    btn.style.background = '#059669';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '#10b981';
                    }, 2000);
                } else {
                    alert('Panoda metin bulunamadı!');
                }
            })
            .catch(err => {
                console.error('Yapıştırma hatası:', err);
                alert('Yapıştırma izni reddedildi veya panoda metin yok!');
            });
    } else {
        alert('Tarayıcınız otomatik yapıştırma özelliğini desteklemiyor. Lütfen Ctrl+V ile yapıştırın.');
    }
}

// Özel talimatları kopyala
function copyOzelTalimatlar() {
    const textarea = document.getElementById('ozel_talimatlar_textarea');
    const text = textarea.value;
    
    if (!text || text.trim() === '') {
        alert('Kopyalanacak metin yok!');
        return;
    }
    
    // Clipboard API kullan
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Başarılı - buton metnini geçici değiştir
                const btn = document.getElementById('copy_ozel_talimatlar_btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '✓ Kopyalandı!';
                btn.style.background = '#10b981';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '#667eea';
                }, 2000);
            })
            .catch(err => {
                console.error('Kopyalama hatası:', err);
                // Fallback yöntem
                fallbackCopy(textarea);
            });
    } else {
        // Eski tarayıcılar için fallback
        fallbackCopy(textarea);
    }
}

// Fallback kopyalama yöntemi
function fallbackCopy(textarea) {
    try {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // Mobil için
        document.execCommand('copy');
        
        const btn = document.getElementById('copy_ozel_talimatlar_btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Kopyalandı!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '#667eea';
        }, 2000);
    } catch (err) {
        console.error('Kopyalama hatası:', err);
        alert('Kopyalama başarısız. Metni manuel olarak seçip kopyalayın.');
    }
}

// Textarea auto-resize - içerik arttıkça yükseklik otomatik artar, scroll kullanmaz
function setupTextareaAutoResize() {
    const textarea = document.getElementById('ozel_talimatlar_textarea');
    if (!textarea) return;
    
    function adjustHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
    }
    
    textarea.addEventListener('input', adjustHeight);
    // İlk yükleme için de ayarla
    adjustHeight();
}

// Diş çekimi kontrollerini ayarla
function setupDisCekimiControls() {
    const hicbiriRadio = document.querySelector('input[name="dis_cekimi"][value="hicbiri"]');
    const buDisleriCekRadio = document.querySelector('input[name="dis_cekimi"][value="bu_disleri_cek"]');
    const disCekimiGrid = document.getElementById('dis_cekimi_grid');
    
    // "Bu dişleri çek" seçildiğinde grid'i göster
    if (buDisleriCekRadio && disCekimiGrid) {
        buDisleriCekRadio.addEventListener('change', function() {
            if (this.checked) {
                disCekimiGrid.style.display = 'block';
            }
        });
    }
    
    // "Hiçbiri" seçildiğinde grid'i gizle
    if (hicbiriRadio && disCekimiGrid) {
        hicbiriRadio.addEventListener('change', function() {
            if (this.checked) {
                disCekimiGrid.style.display = 'none';
                // Tüm diş checkbox'larını temizle
                const toothCheckboxes = document.querySelectorAll('input[name="cekilecek_dis"]');
                toothCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        });
    }
}

// Diş hareketi, Mandibular ve Ortognatik - sadece birini seçilebilir yap
function setupMutuallyExclusiveOptions() {
    const disHareketiCheckbox = document.querySelector('input[name="dis_hareketi_secenekleri"]');
    const mandibularCheckbox = document.querySelector('input[name="mandibular_ilerletme"]');
    const ortognatikCheckbox = document.querySelector('input[name="ortognatik_cerrahi"]');
    const posteriorIPRCheckbox = document.querySelector('input[name="posterior_ipr"]');
    const distalizasyonCheckbox = document.querySelector('input[name="distalizasyon_checkbox"]');
    const sinif23Checkbox = document.querySelector('input[name="sinif_2_3_duzeltme"]');
    const mandibularSubOptions = document.getElementById('mandibular_sub_options');
    
    if (disHareketiCheckbox && mandibularCheckbox && ortognatikCheckbox) {
        // Mandibular seçildiğinde diğerlerini kaldır ve alt seçenekleri göster/gizle
        mandibularCheckbox.addEventListener('change', function(e) {
            if (this.checked) {
                disHareketiCheckbox.checked = false;
                ortognatikCheckbox.checked = false;
                
                // Diş hareketi alt seçeneklerini pasif yap
                if (posteriorIPRCheckbox) {
                    posteriorIPRCheckbox.disabled = true;
                    posteriorIPRCheckbox.checked = false;
                }
                if (distalizasyonCheckbox) {
                    distalizasyonCheckbox.disabled = true;
                    distalizasyonCheckbox.checked = false;
                }
                if (sinif23Checkbox) {
                    sinif23Checkbox.disabled = true;
                    sinif23Checkbox.checked = false;
                }
                
                // Mandibular alt seçeneklerini göster
                if (mandibularSubOptions) {
                    mandibularSubOptions.style.display = 'block';
                }
            } else {
                // Mandibular kaldırıldığında alt seçenekleri aktif et ve gizle
                if (posteriorIPRCheckbox) posteriorIPRCheckbox.disabled = false;
                if (distalizasyonCheckbox) distalizasyonCheckbox.disabled = false;
                if (sinif23Checkbox) sinif23Checkbox.disabled = false;
                
                // Mandibular alt seçeneklerini gizle
                if (mandibularSubOptions) {
                    mandibularSubOptions.style.display = 'none';
                }
            }
        });
        
        // Ortognatik seçildiğinde diğerlerini kaldır
        ortognatikCheckbox.addEventListener('click', function(e) {
            if (this.checked) {
                disHareketiCheckbox.checked = false;
                mandibularCheckbox.checked = false;
                
                // Diş hareketi alt seçeneklerini pasif yap
                if (posteriorIPRCheckbox) {
                    posteriorIPRCheckbox.disabled = true;
                    posteriorIPRCheckbox.checked = false;
                }
                if (distalizasyonCheckbox) {
                    distalizasyonCheckbox.disabled = true;
                    distalizasyonCheckbox.checked = false;
                }
                if (sinif23Checkbox) {
                    sinif23Checkbox.disabled = true;
                    sinif23Checkbox.checked = false;
                }
                
                // Mandibular alt seçeneklerini gizle
                if (mandibularSubOptions) {
                    mandibularSubOptions.style.display = 'none';
                }
            } else {
                // Ortognatik kaldırıldığında alt seçenekleri aktif et
                if (posteriorIPRCheckbox) posteriorIPRCheckbox.disabled = false;
                if (distalizasyonCheckbox) distalizasyonCheckbox.disabled = false;
                if (sinif23Checkbox) sinif23Checkbox.disabled = false;
            }
        });
        
        // Diş hareketi seçildiğinde diğerlerini kaldır ve alt seçenekleri aktif et
        disHareketiCheckbox.addEventListener('click', function(e) {
            if (this.checked && e.isTrusted) {
                mandibularCheckbox.checked = false;
                ortognatikCheckbox.checked = false;
                
                // Alt seçenekleri aktif et
                if (posteriorIPRCheckbox) posteriorIPRCheckbox.disabled = false;
                if (distalizasyonCheckbox) distalizasyonCheckbox.disabled = false;
                if (sinif23Checkbox) sinif23Checkbox.disabled = false;
                
                // Mandibular alt seçeneklerini gizle
                if (mandibularSubOptions) {
                    mandibularSubOptions.style.display = 'none';
                }
            }
        });
    }
}

// Karşılıklı dışlama kontrolü - diğer checkbox'ları temizle
function clearMutuallyExclusiveOptions(exceptCheckbox) {
    const disHareketiCheckbox = document.querySelector('input[name="dis_hareketi_secenekleri"]');
    const mandibularCheckbox = document.querySelector('input[name="mandibular_ilerletme"]');
    const ortognatikCheckbox = document.querySelector('input[name="ortognatik_cerrahi"]');
    
    if (exceptCheckbox !== 'dis_hareketi' && disHareketiCheckbox) {
        disHareketiCheckbox.checked = false;
    }
    if (exceptCheckbox !== 'mandibular' && mandibularCheckbox) {
        mandibularCheckbox.checked = false;
    }
    if (exceptCheckbox !== 'ortognatik' && ortognatikCheckbox) {
        ortognatikCheckbox.checked = false;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', generatePDF);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    // Hasta tipi değişimini dinle
    showProductSection();
    
    // Ürün tipi değişimini dinle
    showTreatmentSection();
    
    // Tedavi paketi seçimini dinle
    showDetailedForm();
});
