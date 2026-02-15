// Form verilerini topla
function collectFormData() {
    const formData = {};
    
    // Önce genel alanları topla (hasta bilgileri, paket seçimi vs.)
    const generalInputs = document.querySelectorAll('#formContent > .form-section input, #formContent > .form-section select, #formContent > .form-section textarea');
    generalInputs.forEach(input => {
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
            if (input.value) {
                formData[input.name] = input.value;
            }
        }
    });
    
    // Sonra sadece görünür olan detailed-form'un input elementlerini topla
    const visibleForm = document.querySelector('.detailed-form[style*="display: block"], .detailed-form:not([style*="display: none"])');
    if (visibleForm) {
        const inputs = visibleForm.querySelectorAll('input, select, textarea');
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
                if (input.value) {
                    formData[input.name] = input.value;
                }
            }
        });
    }
    
    return formData;
}

// Formu Firebase'e kaydet
async function saveFormToFirebase() {
    if (!db) {
        alert('Firebase bağlantısı kurulamadı! Lütfen firebase-config.js dosyasını yapılandırın.');
        return;
    }

    const formData = collectFormData();
    
    // Hasta adı kontrolü
    if (!formData.hasta_adi || !formData.hasta_soyadi) {
        alert('Lütfen hasta adını ve soyadını girin!');
        return;
    }
    
    // Form türünü ekle (varsayılan: yeni_hasta)
    if (!formData.form_turu) {
        formData.form_turu = 'yeni_hasta';
    }

    // Boş değerleri temizle
    const cleanedData = {};
    Object.keys(formData).forEach(key => {
        const value = formData[key];
        // Sadece dolu değerleri ekle
        if (value !== '' && value !== null && value !== undefined) {
            // Array ise ve boş değilse ekle
            if (Array.isArray(value) && value.length > 0) {
                cleanedData[key] = value;
            }
            // Array değilse direkt ekle
            else if (!Array.isArray(value)) {
                cleanedData[key] = value;
            }
        }
    });

    // Timestamp ekle
    cleanedData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    cleanedData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

    try {
        const docRef = await db.collection('invisalign_forms').add(cleanedData);
        alert(`Form başarıyla kaydedildi!\nForm ID: ${docRef.id}\nHasta: ${cleanedData.hasta_adi} ${cleanedData.hasta_soyadi}`);
        console.log('Form kaydedildi, ID:', docRef.id);
    } catch (error) {
        console.error('Form kaydetme hatası:', error);
        alert('Form kaydedilemedi: ' + error.message);
    }
}

// Formu görüntüleme için yükle
async function loadFormForViewing(formId) {
    if (!db) {
        alert('Firebase bağlantısı kurulamadı!');
        return;
    }
    
    // Kaydet butonunu gizle
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.style.display = 'none';
    
    // Formu Temizle butonunu gizle
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.style.display = 'none';
    
    // Giriş Yapıldı butonunu göster (view mode)
    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
        checkInBtn.style.display = 'inline-block';
        checkInBtn.setAttribute('data-form-id', formId);
    }
    
    try {
        const doc = await db.collection('invisalign_forms').doc(formId).get();
        
        if (!doc.exists) {
            alert('Form bulunamadı!');
            return;
        }
        
        const formData = doc.data();
        
        // Form verilerini doldur
        Object.keys(formData).forEach(key => {
            if (key === 'createdAt' || key === 'updatedAt') return;
            
            const inputs = document.querySelectorAll(`[name="${key}"]`);
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    if (Array.isArray(formData[key])) {
                        if (formData[key].includes(input.value)) {
                            input.checked = true;
                        }
                    } else if (formData[key]) {
                        input.checked = true;
                    }
                } else if (input.type === 'radio') {
                    if (input.value === formData[key]) {
                        input.checked = true;
                        // Change eventi tetikle
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    input.value = formData[key];
                }
            });
        });
        
        // Özel talimatlar - name attribute ile bul (birden fazla aynı ID olabilir)
        const textareas = document.querySelectorAll('textarea[name="ozel_talimatlar"]');
        if (textareas.length > 0 && formData.ozel_talimatlar) {
            textareas.forEach(textarea => {
                // Sadece görünür olan textarea'yı doldur
                const parentSection = textarea.closest('.detailed-form');
                if (parentSection && parentSection.style.display !== 'none') {
                    textarea.value = formData.ozel_talimatlar;
                    textarea.dispatchEvent(new Event('input'));
                }
            });
        }
        
        // Giriş yapıldı durumunu kontrol et ve butonu güncelle
        if (checkInBtn) {
            if (formData.checked_in) {
                checkInBtn.textContent = '✓ Giriş Yapıldı';
                checkInBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                checkInBtn.disabled = true;
                checkInBtn.style.cursor = 'not-allowed';
                checkInBtn.style.opacity = '0.7';
            }
        }
        
        // Dinamik bölümleri güncelle
        setTimeout(() => {
            showProductSection();
            showTreatmentSection();
            showDetailedForm();
        }, 100);
        
    } catch (error) {
        console.error('Form yükleme hatası:', error);
        alert('Form yüklenemedi: ' + error.message);
    }
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

// Form türü kontrolü - Refinement seçiliyse Hasta Tipi ve devamını göster/gizle
function handleFormTypeChange() {
    const formTuruInputs = document.querySelectorAll('input[name="form_turu"]');
    
    formTuruInputs.forEach(input => {
        input.addEventListener('change', function() {
            const hastaTipiSection = document.getElementById('hasta_tipi_section');
            const refinementFormSection = document.getElementById('refinement_form_section');
            const productSections = document.querySelectorAll('.product-section');
            const treatmentSections = document.querySelectorAll('.treatment-section');
            const detailedForms = document.querySelectorAll('.detailed-form');
            
            if (this.value === 'refinement') {
                // Refinement seçildiğinde:
                // 1. Hasta tipi ve sonrasını gizle
                if (hastaTipiSection) hastaTipiSection.style.display = 'none';
                productSections.forEach(s => s.style.display = 'none');
                treatmentSections.forEach(s => s.style.display = 'none');
                detailedForms.forEach(f => f.style.display = 'none');
                
                // 2. Refinement formunu göster
                if (refinementFormSection) refinementFormSection.style.display = 'block';
            } else {
                // Yeni hasta seçildiğinde:
                // 1. Refinement formunu gizle
                if (refinementFormSection) refinementFormSection.style.display = 'none';
                
                // 2. Hasta tipi seçimini göster
                if (hastaTipiSection) hastaTipiSection.style.display = 'block';
            }
        });
    });
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
    // Tüm detailed formları gizle fonksiyonu
    function hideAllDetailedForms() {
        document.querySelectorAll('.detailed-form').forEach(form => {
            form.style.display = 'none';
        });
    }
    
    // Yetişkin comprehensive paketi
    const yetiskinComprehensive = document.querySelector('input[name="tedavi_secenegi"][value="comprehensive"]');
    if (yetiskinComprehensive) {
        yetiskinComprehensive.addEventListener('change', function() {
            if (this.checked) {
                hideAllDetailedForms(); // Önce hepsini gizle
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
    
    // Yetişkin moderate paketi
    const yetiskinModerate = document.querySelector('input[name="tedavi_secenegi"][value="moderate"]');
    if (yetiskinModerate) {
        yetiskinModerate.addEventListener('change', function() {
            if (this.checked) {
                hideAllDetailedForms(); // Önce hepsini gizle
                const detayliForm = document.getElementById('detayli_form_yetiskin_moderate');
                if (detayliForm) {
                    detayliForm.style.display = 'block';
                    // Forma scroll yap
                    setTimeout(() => {
                        detayliForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Textarea auto-resize'ı başlat
                        setupTextareaAutoResize();
                    }, 100);
                }
            }
        });
    }
    
    // Ergen comprehensive paketi
    const ergenComprehensive = document.querySelector('input[name="tedavi_secenegi_ergen"][value="comprehensive"]');
    if (ergenComprehensive) {
        ergenComprehensive.addEventListener('change', function() {
            if (this.checked) {
                hideAllDetailedForms(); // Önce hepsini gizle
                const detayliForm = document.getElementById('detayli_form_ergen_comprehensive');
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
                        // Erupsiyon kompansasyonu kontrollerini başlat
                        setupErupsiyonKontrolleri();
                        // Textarea auto-resize'ı başlat
                        setupTextareaAutoResize();
                    }, 100);
                }
            }
        });
    }
    
    // Ergen moderate paketi
    const ergenModerate = document.querySelector('input[name="tedavi_secenegi_ergen"][value="moderate"]');
    if (ergenModerate) {
        ergenModerate.addEventListener('change', function() {
            if (this.checked) {
                hideAllDetailedForms(); // Önce hepsini gizle
                const detayliForm = document.getElementById('detayli_form_ergen_moderate');
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
                        // Erupsiyon kompansasyonu kontrollerini başlat
                        setupErupsiyonKontrolleri();
                        // Textarea auto-resize'ı başlat
                        setupTextareaAutoResize();
                    }, 100);
                }
            }
        });
    }
    
    // Çocuk first comprehensive paketi
    const cocukFirst = document.querySelector('input[name="tedavi_secenegi_cocuk_first"][value="first_comprehensive"]');
    if (cocukFirst) {
        cocukFirst.addEventListener('change', function() {
            if (this.checked) {
                hideAllDetailedForms(); // Önce hepsini gizle
                const detayliForm = document.getElementById('detayli_form_cocuk_first');
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
                        // Erupsiyon kompansasyonu kontrollerini başlat
                        setupErupsiyonKontrolleri();
                        // Textarea auto-resize'ı başlat
                        setupTextareaAutoResize();
                    }, 100);
                }
            }
        });
    }
    
    // Henüz aktif olmayan paketler için uyarı
    setupInactivePackageWarnings();
}

// Henüz aktif olmayan paketler için uyarı mesajları
function setupInactivePackageWarnings() {
    const inactivePackages = [
        // Yetişkin
        { selector: 'input[name="tedavi_secenegi"][value="lite"]', name: 'Lite Paketi' },
        { selector: 'input[name="tedavi_secenegi"][value="express"]', name: 'Express Paketi' },
        { selector: 'input[name="urun_tipi_yetiskin"][value="vivera_retainer"]', name: 'Vivera Retainerları' },
        { selector: 'input[name="urun_tipi_yetiskin"][value="gulumseme_mimarisi"]', name: 'Gülümseme Mimarisi' },
        
        // Ergen
        { selector: 'input[name="tedavi_secenegi_ergen"][value="lite"]', name: 'Lite Paketi' },
        { selector: 'input[name="tedavi_secenegi_ergen"][value="express"]', name: 'Express Paketi' },
        { selector: 'input[name="urun_tipi_ergen"][value="vivera_retainer"]', name: 'Vivera Retainerları' },
        { selector: 'input[name="tedavi_secenegi_palatal"][value="palatal_genisletici"]', name: 'Palatal Genişleticiler' },
        
        // Çocuk
        { selector: 'input[name="tedavi_secenegi_cocuk_vivera"][value="vivera_retainer"]', name: 'Vivera Retainerları' },
        { selector: 'input[name="tedavi_secenegi_cocuk_palatal"][value="palatal_genisletici"]', name: 'Palatal Genişleticiler' }
    ];
    
    inactivePackages.forEach(pkg => {
        const element = document.querySelector(pkg.selector);
        if (element) {
            element.addEventListener('change', function(e) {
                if (this.checked) {
                    e.preventDefault();
                    this.checked = false;
                    alert(`${pkg.name} henüz aktive edilmemiştir.\n\nLütfen başka bir tedavi seçeneği seçiniz.`);
                }
            });
        }
    });
}

// A-P İlişkisi kontrollerini ayarla
function setupAPControls() {
    // Görünür formu bul
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const apSagRadios = visibleForm.querySelectorAll('input[name*="ap_sag"]');
    const apSolRadios = visibleForm.querySelectorAll('input[name*="ap_sol"]');
    
    // Kontrol edilecek elementler
    const disHareketiCheckbox = visibleForm.querySelector('input[name*="dis_hareketi_secenekleri"]');
    const posteriorIPRCheckbox = visibleForm.querySelector('input[name*="posterior_ipr"]');
    const sinif23Checkbox = visibleForm.querySelector('input[name*="sinif_2_3_duzeltme"]');
    const distalizasyonCheckbox = visibleForm.querySelector('input[name*="distalizasyon_checkbox"]');
    const mandibularCheckbox = visibleForm.querySelector('input[name*="mandibular_ilerletme"]');
    const ortognatikCheckbox = visibleForm.querySelector('input[name*="ortognatik_cerrahi"]');
    
    function updateControlStates() {
        // Seçili değerleri al
        const sagValue = visibleForm.querySelector('input[name*="ap_sag"]:checked')?.value;
        const solValue = visibleForm.querySelector('input[name*="ap_sol"]:checked')?.value;
        
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
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const sinif23Checkbox = visibleForm.querySelector('input[name*="sinif_2_3_duzeltme"]');
    const precisionCutsRadios = visibleForm.querySelectorAll('input[name*="precision_cuts"]');
    const distalizasyonRadios = visibleForm.querySelectorAll('input[name*="distalizasyon"]');
    
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
    const distalizasyonParentCheckbox = visibleForm.querySelector('input[name*="distalizasyon_checkbox"]');
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
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const acikKapanisRadio = visibleForm.querySelector('input[name*="overbite"][value="acik_kapanis"]');
    const derinKapanisRadio = visibleForm.querySelector('input[name*="overbite"][value="derin_kapanis"]');
    const hizalamaSonrasiRadio = visibleForm.querySelector('input[name*="overbite"][value="hizalama_sonrasi"]');
    const ilkKoruRadio = visibleForm.querySelector('input[name*="overbite"][value="ilk_koru"]');
    
    // Açık kapanış checkboxları
    const acikUstCheckbox = visibleForm.querySelector('input[name*="acik_kapanis_ust"]');
    const acikAltCheckbox = visibleForm.querySelector('input[name*="acik_kapanis_alt"]');
    const acikDigerCheckbox = visibleForm.querySelector('input[name*="acik_kapanis_diger"]');
    const acikUstAnterior = visibleForm.querySelector('input[name*="acik_kapanis_ust_anterior_ekstruzyon"]');
    const acikUstPosterior = visibleForm.querySelector('input[name*="acik_kapanis_ust_posterior_intruzyon"]');
    const acikAltAnterior = visibleForm.querySelector('input[name*="acik_kapanis_alt_anterior_ekstruzyon"]');
    const acikAltPosterior = visibleForm.querySelector('input[name*="acik_kapanis_alt_posterior_intruzyon"]');
    
    // Derin kapanış checkboxları
    const derinUstCheckbox = visibleForm.querySelector('input[name*="derin_kapanis_ust"]');
    const derinAltCheckbox = visibleForm.querySelector('input[name*="derin_kapanis_alt"]');
    const derinDigerCheckbox = visibleForm.querySelector('input[name*="derin_kapanis_diger"]');
    const derinUstAnterior = visibleForm.querySelector('input[name*="derin_kapanis_ust_anterior_intruzyon"]');
    const derinUstPosterior = visibleForm.querySelector('input[name*="derin_kapanis_ust_posterior_ekstruzyon"]');
    const derinAltAnterior = visibleForm.querySelector('input[name*="derin_kapanis_alt_anterior_intruzyon"]');
    const derinAltPosterior = visibleForm.querySelector('input[name*="derin_kapanis_alt_posterior_ekstruzyon"]');
    
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
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const lingualRamplerRadio = visibleForm.querySelector('input[name*="bite_ramp"][value="lingual_rampler"]');
    const otomatikRadio = visibleForm.querySelector('input[name*="bite_ramp"][value="otomatik"]');
    const hicbiriRadio = visibleForm.querySelector('input[name*="bite_ramp"][value="hicbiri"]');
    const subOptionsDiv = visibleForm.querySelector('#bite_ramp_sub_options, [id*="bite_ramp_sub_options"]');
    
    const kesiciDislerRadio = visibleForm.querySelector('input[name*="bite_ramp_dis_tipi"][value="kesici_disler"]');
    const kaninlerRadio = visibleForm.querySelector('input[name*="bite_ramp_dis_tipi"][value="kaninler"]');
    const kesiciDislerOptionsDiv = visibleForm.querySelector('#kesici_disler_options, [id*="kesici_disler_options"]');
    
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
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const iprIyilestirRadio = visibleForm.querySelector('input[name*="orta_hat"][value="ipr_iyilestir"]');
    const hizalamaSonrasiRadio = visibleForm.querySelector('input[name*="orta_hat"][value="hizalama_sonrasi"]');
    const ilkKoruRadio = visibleForm.querySelector('input[name*="orta_hat"][value="ilk_koru"]');
    
    const ustCheckbox = visibleForm.querySelector('input[name*="orta_hat_ust"]');
    const altCheckbox = visibleForm.querySelector('input[name*="orta_hat_alt"]');
    
    const ustYonRadios = visibleForm.querySelectorAll('input[name*="orta_hat_ust_yon"]');
    const altYonRadios = visibleForm.querySelectorAll('input[name*="orta_hat_alt_yon"]');
    
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

// Erupsiyon kompansasyonu kontrollerini ayarla
function setupErupsiyonKontrolleri() {
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const hicbiriRadio = visibleForm.querySelector('input[name*="erupsiyon_kompansasyonu"][value="hicbiri"]');
    const suDislerRadio = visibleForm.querySelector('input[name*="erupsiyon_kompansasyonu"][value="su_disler"]');
    
    // Tüm erupsiyon diş checkbox'larını bul
    const erupsiyonCheckboxes = visibleForm.querySelectorAll('input[type="checkbox"][name*="erupsiyon_"]');
    
    // Terminal azıdişi kontrolü
    const terminalHicbiriRadio = visibleForm.querySelector('input[name*="terminal_azidisi"][value="hicbiri"]');
    const terminalSuIslerRadio = visibleForm.querySelector('input[name*="terminal_azidisi"][value="su_isler"]');
    
    // Tüm terminal radio buttonları (name başında terminal_ olan ama terminal_azidisi ve terminal_baslat_asama olmayan)
    const terminalRadios = visibleForm.querySelectorAll('input[type="radio"][name*="terminal_"]:not([name*="terminal_azidisi"])');
    const terminalAsamaInput = visibleForm.querySelector('input[name*="terminal_baslat_asama"]');
    
    // Erupsiyon checkbox'larını aktif/pasif yap
    function updateErupsiyonCheckboxes() {
        const isEnabled = suDislerRadio && suDislerRadio.checked;
        erupsiyonCheckboxes.forEach(cb => {
            cb.disabled = !isEnabled;
            if (!isEnabled) cb.checked = false;
        });
    }
    
    // Terminal kontrollerini aktif/pasif yap
    function updateTerminalControls() {
        const isEnabled = terminalSuIslerRadio && terminalSuIslerRadio.checked;
        terminalRadios.forEach(radio => {
            radio.disabled = !isEnabled;
            if (!isEnabled) radio.checked = false;
        });
        if (terminalAsamaInput) {
            terminalAsamaInput.disabled = !isEnabled;
            if (!isEnabled) terminalAsamaInput.value = '';
        }
    }
    
    // Event listener'ları ekle
    if (hicbiriRadio) {
        hicbiriRadio.addEventListener('change', updateErupsiyonCheckboxes);
    }
    if (suDislerRadio) {
        suDislerRadio.addEventListener('change', updateErupsiyonCheckboxes);
    }
    
    if (terminalHicbiriRadio) {
        terminalHicbiriRadio.addEventListener('change', updateTerminalControls);
    }
    if (terminalSuIslerRadio) {
        terminalSuIslerRadio.addEventListener('change', updateTerminalControls);
    }
    
    // İlk yükleme için kontrolleri ayarla
    updateErupsiyonCheckboxes();
    updateTerminalControls();
}

// Textarea auto-resize - içerik arttıkça yükseklik otomatik artar
function setupTextareaAutoResize() {
    // Tüm özel talimatlar textarea'larını bul (tüm suffix'ler için)
    const textareas = document.querySelectorAll('textarea[name^="ozel_talimatlar"]');
    
    textareas.forEach(textarea => {
        function adjustHeight() {
            // Sadece görünür olan textarea için çalış
            const parentSection = textarea.closest('.detailed-form');
            if (!parentSection || parentSection.style.display === 'none') return;
            
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
        }
        
        // Event listener'ları ekle (중복 önlemek için once seçeneği)
        textarea.removeEventListener('input', adjustHeight);
        textarea.addEventListener('input', adjustHeight);
        
        // Paste event'i için de ekle (yapıştırma sonrası çalışması için setTimeout)
        textarea.removeEventListener('paste', adjustHeight);
        textarea.addEventListener('paste', () => setTimeout(adjustHeight, 10));
        
        // İlk yükleme için de ayarla
        adjustHeight();
    });
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
// Diş çekimi kontrollerini ayarla
function setupDisCekimiControls() {
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const hicbiriRadio = visibleForm.querySelector('input[name*="dis_cekimi"][value="hicbiri"]');
    const buDisleriCekRadio = visibleForm.querySelector('input[name*="dis_cekimi"][value="bu_disleri_cek"]');
    const disCekimiGrid = visibleForm.querySelector('#dis_cekimi_grid, [id*="dis_cekimi_grid"]');
    
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
                const toothCheckboxes = visibleForm.querySelectorAll('input[name*="cekilecek_dis"]');
                toothCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        });
    }
}

// Diş hareketi, Mandibular ve Ortognatik - sadece birini seçilebilir yap
function setupMutuallyExclusiveOptions() {
    const visibleForm = document.querySelector('.detailed-form:not([style*="display: none"])');
    if (!visibleForm) return;
    
    const disHareketiCheckbox = visibleForm.querySelector('input[name*="dis_hareketi_secenekleri"]');
    const mandibularCheckbox = visibleForm.querySelector('input[name*="mandibular_ilerletme"]');
    const ortognatikCheckbox = visibleForm.querySelector('input[name*="ortognatik_cerrahi"]');
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
    const saveBtn = document.getElementById('saveBtn');
    
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', generatePDF);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveFormToFirebase);
    }
    
    // Giriş Yapıldı butonu
    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
        checkInBtn.addEventListener('click', async function() {
            const formId = this.getAttribute('data-form-id');
            if (!formId) {
                alert('Form ID bulunamadı!');
                return;
            }
            
            if (confirm('Bu hastanın girişini yapmak istediğinizden emin misiniz?')) {
                try {
                    await db.collection('invisalign_forms').doc(formId).update({
                        checked_in: true,
                        checked_in_at: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Butonu güncelle
                    this.textContent = '✓ Giriş Yapıldı';
                    this.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    this.disabled = true;
                    this.style.cursor = 'not-allowed';
                    this.style.opacity = '0.7';
                    
                    alert('Giriş işlemi başarıyla tamamlandı!');
                } catch (error) {
                    console.error('Giriş işlemi hatası:', error);
                    alert('Giriş işlemi yapılamadı: ' + error.message);
                }
            }
        });
    }
    
    // URL'de view parametresi varsa formu yükle
    const urlParams = new URLSearchParams(window.location.search);
    const viewFormId = urlParams.get('view');
    if (viewFormId) {
        loadFormForViewing(viewFormId);
    }
    
    // Form türü değişimini dinle
    handleFormTypeChange();
    
    // Hasta tipi değişimini dinle
    showProductSection();
    
    // Ürün tipi değişimini dinle
    showTreatmentSection();
    
    // Tedavi paketi seçimini dinle
    showDetailedForm();
});
