# 🧪 NanoCap v0.3.0 - Manuel Test Kılavuzu

**Test Versiyonu:** 0.3.0
**Test Tarihi:** 6 Kasım 2025
**Tahmini Süre:** 30-45 dakika
**Gereksinimler:** Chrome 110+ (Developer Mode aktif)

---

## 📋 Hazırlık

### 1. Extension'ı Yükle

```bash
# Terminal'de:
cd /home/user/NanoCap

# Chrome'da:
1. chrome://extensions adresine git
2. Sağ üstte "Developer mode" toggle'ını AÇ
3. "Load unpacked" butonuna tıkla
4. /home/user/NanoCap/dist/ klasörünü seç
5. NanoCap extension'ı listede görünmeli ✅
```

### 2. Icon Kontrolü

```
✓ Toolbar'da NanoCap iconu görünüyor mu?
✓ Icon tıklanabilir mi?
✓ Icon hover'da tooltip gösteriyor mu? ("NanoCap - Ultra Low Size Recorder")
```

### 3. Console Hazırlığı

```bash
# Service Worker Console:
chrome://extensions → NanoCap → "service worker" → inspect

# Popup Console:
Extension icon'a sağ tık → "Inspect popup"

# Offscreen Console:
chrome://extensions → NanoCap → "Inspect views: offscreen.html"
```

---

## 🧪 Test Senaryoları

### ✅ Test #1: Popup Açılış ve UI Kontrolü

**Süre:** 2 dakika

**Adımlar:**
1. NanoCap icon'una tıkla
2. Popup açıldı mı? ✓
3. Tüm UI elementleri görünüyor mu? ✓

**Kontrol Listesi:**
```
□ Header: "🎥 NanoCap" başlık
□ Version badge: "v0.3.0"
□ Status: "Hazır" (yeşil dot)
□ Timer: Gizli (hidden)
□ Kalite seçenekleri: 4 preset (Ultra Düşük, Düşük, Dengeli, Yüksek)
□ Checkboxlar: Ses Kaydı, Video Kaydı, FFmpeg, Ses Aynalama, Mikrofon
□ Butonlar: "Kaydı Başlat" görünür
□ Footer: Version, ayarlar, yardım, GitHub linkleri
□ Bilgi paneli: Boyut tahmini, sıkıştırma, CPU, codec
```

**Console Kontrolü:**
```javascript
// Popup console'da şunları görmeli:
"NanoCap Popup initialized"
"NanoCap Popup ready"

// Hata olmamalı! ❌
```

**Sonuç:** □ BAŞARILI  □ BAŞARISIZ

**Notlar:**
_________________________________________________

---

### ✅ Test #2: Ayarların Kaydedilmesi

**Süre:** 2 dakika

**Adımlar:**
1. Kaliteyi "Yüksek" olarak değiştir
2. "Ses Kaydı" checkbox'ını kapat
3. "FFmpeg" checkbox'ını aç
4. Popup'ı kapat
5. Popup'ı tekrar aç

**Beklenen:**
```
✓ Kalite hala "Yüksek"
✓ Ses Kaydı hala kapalı
✓ FFmpeg hala açık
✓ Ayarlar korundu (chrome.storage.sync)
```

**Console Kontrolü:**
```javascript
// Popup console'da:
"Settings saved" veya benzeri mesaj görmeli
```

**Sonuç:** □ BAŞARILI  □ BAŞARISIZ

**Notlar:**
_________________________________________________

---

### ✅ Test #3: Basit Kayıt (FFmpeg Kapalı)

**Süre:** 5 dakika

**Adımlar:**
1. Popup'ı aç
2. FFmpeg checkbox'ını KAPAT
3. Kalite: "Dengeli" seç
4. "Kaydı Başlat" butonuna tıkla
5. Kaynak seç (Tab, Window, veya Entire Screen)
6. Örnek: Bu tab'ı seç ve "Share" tıkla
7. 10 saniye bekle (timer çalışıyor mu kontrol et)
8. "Kaydı Durdur" butonuna tıkla

**Beklenen:**
```
✓ "Kaydı Başlat" butonu gizlendi
✓ "Kaydı Durdur" butonu göründü
✓ Status: "Kaydediyor" (kırmızı dot)
✓ Timer: 00:01, 00:02, ... 00:10 artıyor
✓ Kayıt durduğunda download dialog açıldı
✓ Dosya indirildi: nanocap_XXXXXXXXX.webm
```

**Console Kontrolü:**
```javascript
// Service Worker console:
"NanoCap Service Worker initialized"
"Starting recording with settings: ..."
"Offscreen document created successfully"
"Recording started successfully"
"Stopping recording..."
"Recording stopped"

// Offscreen console:
"NanoCap Offscreen Document initialized"
"Starting recording with options: ..."
"Stream acquired: MediaStream {...}"
"Recording started successfully"
"Recording stopped, processing chunks..."
"Final blob size: XXXXX bytes"
"Export request sent: nanocap_XXXX.webm"

// Hata YOK! ❌
```

**Dosya Kontrolü:**
```bash
# İndirilen dosyayı kontrol et:
1. Downloads klasörüne git
2. nanocap_XXXXXXXXX.webm dosyasını bul
3. Dosya boyutu: ~1-2 MB (10 saniye için)
4. Video player'da aç (VLC, Chrome, vb.)
5. Video çalışıyor mu? ✓
6. Ses var mı? (eğer ses kaynağı varsa) ✓
7. Görüntü kalitesi iyi mi? ✓
```

**Sonuç:** □ BAŞARILI  □ BAŞARISIZ

**Notlar:**
_________________________________________________

---

### ✅ Test #4: FFmpeg Sıkıştırma Testi (KRİTİK)

**Süre:** 10 dakika

**Adımlar:**
1. Popup'ı aç
2. FFmpeg checkbox'ını AÇ ✓
3. Kalite: "Dengeli" seç
4. "Kaydı Başlat" butonuna tıkla
5. Kaynak seç (Tab)
6. 15 saniye kaydet
7. "Kaydı Durdur" butonuna tıkla
8. FFmpeg sıkıştırma başladı mı kontrol et

**Beklenen:**
```
✓ Kayıt normal şekilde durduruldu
✓ Progress mesajı göründü: "İşleniyor..." veya benzeri
✓ FFmpeg.wasm yüklendi (ilk kullanımda ~30 MB, internete ihtiyaç var)
✓ Sıkıştırma progress gösteriliyor
✓ Sıkıştırma tamamlandı
✓ Dosya indirildi (sıkıştırılmış versiyon)
```

**Console Kontrolü (ÖNEMLİ!):**
```javascript
// Offscreen console'da MUTLAKA görmeli:

"Starting FFmpeg compression... {settings: {...}}"
"Loading FFmpeg.wasm from CDN..."
"[FFmpeg]: ..." (FFmpeg log mesajları)
"[FFmpeg] Progress: XX.XX%" (progress updates)
"[FFmpeg] Input file written: input.webm"
"[FFmpeg] Running command: -i input.webm ..."
"[FFmpeg] Compression complete: {
  originalSize: XXXXX,
  compressedSize: YYYYY,
  ratio: ZZ.Z%,
  savings: X.X MB
}"
"Compression completed: {originalSize: ..., compressedSize: ..., ratio: ...}"

// Service Worker console'da:
"Requesting FFmpeg compression from offscreen document..."
"FFmpeg compression successful"
```

**Dosya Karşılaştırma:**
```
Orijinal (FFmpeg kapalı): ~2-3 MB (15 saniye)
Sıkıştırılmış (FFmpeg açık): ~1-1.5 MB (15 saniye)
Tasarruf: %30-50 olmalı! ✓

Orijinal dosyayı bul ve boyutları karşılaştır.
```

**Hata Durumları:**
```javascript
// Eğer FFmpeg yüklenemezse:
"Failed to load FFmpeg.wasm: ..."
"FFmpeg compression failed, using original: ..."
→ Orijinal dosya indirilmeli (fallback) ✓

// İnternet yoksa:
ERR_INTERNET_DISCONNECTED
→ FFmpeg yüklenemez, orijinal dosya kullanılır ✓
```

**Sonuç:** □ BAŞARILI  □ BAŞARISIZ  □ FALLBACK ÇALIŞTI

**Notlar:**
_________________________________________________

---

### ✅ Test #5: Farklı Kalite Presetleri

**Süre:** 8 dakika (her preset için 2 dk)

**Test 5a: Ultra Düşük**
```
Kalite: Ultra Düşük
Süre: 10 saniye
FFmpeg: Kapalı

Beklenen dosya boyutu: ~500 KB - 1 MB
Görüntü: 720p, 15 FPS (düşük kalite ama izlenebilir)
Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Test 5b: Düşük**
```
Kalite: Düşük
Süre: 10 saniye
FFmpeg: Kapalı

Beklenen dosya boyutu: ~1-1.5 MB
Görüntü: 720p, 20 FPS (orta kalite)
Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Test 5c: Dengeli**
```
Kalite: Dengeli
Süre: 10 saniye
FFmpeg: Kapalı

Beklenen dosya boyutu: ~1.5-2 MB
Görüntü: 720p, 24 FPS (iyi kalite)
Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Test 5d: Yüksek**
```
Kalite: Yüksek
Süre: 10 saniye
FFmpeg: Kapalı

Beklenen dosya boyutu: ~2.5-4 MB
Görüntü: 1080p, 30 FPS (yüksek kalite)
Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Sonuç:** □ TÜM PRESETLER ÇALIŞIYOR  □ SORUN VAR

---

### ✅ Test #6: Ses Kontrolleri

**Süre:** 5 dakita

**Test 6a: Ses Kaydı Açık**
```
1. YouTube'da video aç
2. Ses Kaydı: ✓ (açık)
3. Kayıt başlat → 5 saniye → durdur
4. Dosyayı aç ve ses var mı kontrol et

Sonuç: □ SES VAR  □ SES YOK  □ SORUN
```

**Test 6b: Ses Kaydı Kapalı**
```
1. YouTube'da video aç
2. Ses Kaydı: ✗ (kapalı)
3. Kayıt başlat → 5 saniye → durdur
4. Dosyayı aç ve ses YOK mu kontrol et

Sonuç: □ SES YOK (DOĞRU)  □ SES VAR (HATA)
```

**Test 6c: Ses Aynalama**
```
1. YouTube'da video aç
2. Ses Aynalama: ✓ (açık)
3. Kayıt başlat
4. Kayıt sırasında sesi duyuyor musun?

Beklenen: Kayıt sırasında ses kullanıcıya çalmalı
Sonuç: □ ÇALIŞIYOR  □ ÇALIŞMIYOR
```

---

### ✅ Test #7: Hata Durumları

**Süre:** 5 dakika

**Test 7a: İzin Reddi**
```
1. Kayıt başlat
2. Kaynak seçim ekranında "Cancel" tıkla

Beklenen:
✓ Hata mesajı gösterilmeli
✓ Extension çökmemeli
✓ "Başlat" butonu tekrar tıklanabilir olmalı

Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Test 7b: Popup Kapatma**
```
1. Kayıt başlat
2. Popup'ı kapat
3. 10 saniye bekle
4. Popup'ı tekrar aç

Beklenen:
✓ Kayıt devam ediyor olmalı
✓ Timer çalışıyor olmalı
✓ "Kaydı Durdur" butonu görünür olmalı

Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Test 7c: FFmpeg Hatası (İnternet Kapalı)**
```
1. İnterneti kapat
2. FFmpeg açık, kayıt başlat ve durdur

Beklenen:
✓ "Failed to load FFmpeg" uyarısı console'da
✓ Orijinal dosya yine de indirilmeli (fallback)
✓ Extension çökmemeli

Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

---

### ✅ Test #8: Performans ve Kararlılık

**Süre:** 5 dakika

**Test 8a: Uzun Kayıt**
```
1. 60 saniye (1 dakika) kayıt yap
2. FFmpeg kapalı

Beklenen:
✓ Kayıt sorunsuz tamamlanmalı
✓ Memory leak olmamalı
✓ Dosya boyutu: ~10-15 MB (Dengeli kalite)
✓ Video oynatılabilir olmalı

Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Test 8b: Ardışık Kayıtlar**
```
1. Kayıt yap → durdur → indir
2. Hemen tekrar kayıt yap → durdur → indir
3. 3 kez tekrarla

Beklenen:
✓ Her kayıt başarılı olmalı
✓ Dosyalar unique isimlerle indirilmeli
✓ Memory artışı olmamalı (Task Manager'da kontrol et)

Sonuç: □ BAŞARILI  □ BAŞARISIZ
```

**Test 8c: CPU & RAM Kullanımı**
```
1. Task Manager'ı aç (Shift+Esc Chrome içinde)
2. Kayıt başlat (FFmpeg kapalı)
3. CPU ve Memory kullanımını gözlemle

Beklenen:
✓ CPU: %10-15 (kayıt sırasında)
✓ Memory: <300 MB
✓ Kayıt sonrası: CPU %0-1, Memory stabil

FFmpeg açıkken:
✓ CPU: %15-40 (sıkıştırma sırasında)
✓ Memory: <500 MB
✓ Sıkıştırma sonrası: Normal'e dönmeli

Sonuç: □ PERFORMANS İYİ  □ SORUN VAR
```

---

## 📊 Test Sonuçları Özeti

### Test Başarı Oranı

```
✓ Test #1: Popup Açılış           □ BAŞARILI  □ BAŞARISIZ
✓ Test #2: Ayarlar                □ BAŞARILI  □ BAŞARISIZ
✓ Test #3: Basit Kayıt            □ BAŞARILI  □ BAŞARISIZ
✓ Test #4: FFmpeg Sıkıştırma      □ BAŞARILI  □ BAŞARISIZ
✓ Test #5: Kalite Presetleri      □ BAŞARILI  □ BAŞARISIZ
✓ Test #6: Ses Kontrolleri        □ BAŞARILI  □ BAŞARISIZ
✓ Test #7: Hata Durumları         □ BAŞARILI  □ BAŞARISIZ
✓ Test #8: Performans             □ BAŞARILI  □ BAŞARISIZ

TOPLAM: ___/8 BAŞARILI
Başarı Oranı: ___%
```

### Kritik Sorunlar

**🔴 Yüksek Öncelik (Blocker):**
```
1. ___________________________________
2. ___________________________________
3. ___________________________________
```

**🟡 Orta Öncelik:**
```
1. ___________________________________
2. ___________________________________
```

**🟢 Düşük Öncelik (Nice to have):**
```
1. ___________________________________
2. ___________________________________
```

---

## 🐛 Bilinen Sorunlar ve Workaround'lar

### Sorun #1: FFmpeg İlk Yükleme Yavaş
```
Durum: FFmpeg.wasm ilk kullanımda ~30 MB indirir
Workaround: Normal davranış, cache'lenir, sonraki kullanımlar hızlı
Aksiyon: Kullanıcıya bilgi verilebilir (tooltip veya popup mesajı)
```

### Sorun #2: DRM Korumalı İçerik
```
Durum: Netflix, Disney+ gibi DRM korumalı sayfalar siyah ekran
Workaround: Chrome güvenlik özelliği, bypass edilemez
Aksiyon: FAQ'da belirtilmiş, kullanıcı bilgilendirilmiş
```

### Sorun #3: Tab Ses Kesintisi
```
Durum: Chrome'un tabCapture API'si sesi kullanıcıdan keser
Workaround: "Ses Aynalama" özelliği ile çözülebilir
Aksiyon: Varsayılan olarak açık, kullanıcı kapatabilir
```

---

## ✅ Test Tamamlandı Checklist

Test tamamlandıktan sonra:

```
□ Tüm testler başarıyla geçti (veya sorunlar dokümante edildi)
□ Console'larda kritik hata yok
□ Memory leak yok
□ CPU kullanımı makul seviyede
□ Dosyalar düzgün indiriliyor ve oynatılabiliyor
□ FFmpeg sıkıştırma çalışıyor (%30-60 tasarruf)
□ Tüm kalite presetleri çalışıyor
□ Hata durumları graceful handle ediliyor
□ Extension kararlı (çökmüyor)
□ Screenshot'lar alındı (sonraki adım)
```

---

## 📸 Screenshot Checklist (Sonraki Adım)

Test sırasında şu ekran görüntülerini al:

```
□ Popup ana ekranı (varsayılan)
□ Popup kayıt sırasında (timer çalışırken)
□ Ayarlar paneli (tüm seçenekler görünür)
□ FFmpeg sıkıştırma progress
□ Download dialog
□ Dosya boyutu karşılaştırması (orijinal vs sıkıştırılmış)
```

---

## 🚀 Test Sonrası Aksiyonlar

### Eğer Tüm Testler Başarılı:
```
✅ Screenshot'ları hazırla
✅ Chrome Web Store listing'i finalize et
✅ Package'ı submit et
✅ Beta tester'lara duyur
```

### Eğer Kritik Sorun Varsa:
```
❌ Sorunları COMPREHENSIVE_AUDIT_REPORT.md'ye ekle
❌ Bug fix yap
❌ Testleri tekrar çalıştır
❌ Fix commit et ve push et
```

---

**Test Başarıyla Tamamlandı mı?**
□ EVET - Sonraki adıma geç (Screenshot hazırlama)
□ HAYIR - Bug fix gerekli

**Test Eden:** ___________________________
**Test Tarihi:** ___________________________
**Test Süresi:** ___________ dakika
**Final Karar:** □ APPROVE  □ REJECT  □ NEEDS WORK

---

*NanoCap v0.3.0 - Manuel Test Kılavuzu*
*Oluşturulma: 6 Kasım 2025*
*Güncellenme: -/-*
