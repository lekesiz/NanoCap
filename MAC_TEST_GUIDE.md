# 🍎 Mac M4 Max Test Rehberi - NanoCap v0.3.0

## Sistem Gereksinimleri
- ✅ Mac M4 Max (ARM64 native)
- ✅ macOS 15.x+ (Sequoia)
- ✅ Google Chrome 110+
- ✅ ~100 MB boş disk alanı (FFmpeg.wasm için)

---

## 🚀 Hızlı Başlangıç

### 1️⃣ Projeyi Hazırla

```bash
# Terminal'de (Mac)
cd ~/Desktop
git clone https://github.com/lekesiz/NanoCap.git
cd NanoCap

# dist/ klasörü yoksa build et
npm install
npm run build:prod
```

**Alternatif:** Sadece `dist/` klasörünü indirip kullanabilirsiniz.

---

### 2️⃣ Chrome Extension'ı Yükle

1. **Chrome'u Aç**
   ```
   chrome://extensions/
   ```
   Bu adresi Chrome adres çubuğuna yapıştır

2. **Developer Mode'u Etkinleştir**
   - Sağ üst köşede "Developer mode" toggle'ını **AÇ**
   - Toggle mavi olmalı

3. **Extension'ı Yükle**
   - Sol üstte **"Load unpacked"** butonuna tıkla
   - `NanoCap/dist/` klasörünü seç
   - **"Select"** butonuna tıkla

4. **Extension'ı Kontrol Et**
   - ✅ NanoCap uzantısı listede görünmeli
   - ✅ Version: 0.3.0
   - ✅ "Errors" kısmı boş olmalı
   - ✅ Extension ID verilmiş olmalı

5. **Extension'ı Pin'le (Opsiyonel)**
   - Chrome toolbar'da puzzle icon'a tıkla
   - NanoCap yanındaki pin ikonuna tıkla
   - Artık toolbar'da kalıcı olacak

---

## 🧪 Manuel Test Senaryoları

### Test #1: Temel Kayıt İşlevi ⚡ (5 dakika)

**Amaç:** Extension'ın kurulu olduğunu ve temel kaydın çalıştığını doğrula

#### Adımlar:
```
1. NanoCap icon'una tıkla (toolbar'da veya puzzle menüsünde)
2. Popup açılmalı (mor/mavi gradient UI)
3. "Quality" dropdown'ında "Dengeli" seçili olmalı
4. "Ses" ve "Video" checkbox'ları aktif olmalı
5. "Kayda Başla" butonu görünür olmalı
```

#### Beklenen Sonuç:
- ✅ Popup düzgün açılıyor
- ✅ Tüm kontroller görünür ve erişilebilir
- ✅ Hata mesajı yok
- ✅ Console'da kritik hata yok

#### Console Kontrolü:
```javascript
// Chrome DevTools Console (F12)
// Görmemen gereken:
❌ "Error loading extension"
❌ "Cannot read property"
❌ "Uncaught TypeError"

// Görebileceklerin:
✅ "NanoCap Popup initialized"
✅ "NanoCap Popup ready"
```

---

### Test #2: Ekran Kaydı Başlatma 🎬 (10 dakika)

**Amaç:** Kayıt başlatma ve MediaRecorder API'sinin çalıştığını doğrula

#### Hazırlık:
```
1. YouTube'da bir video aç (örn: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
2. NanoCap popup'ını aç
3. Quality: "Dengeli" seçili
4. FFmpeg toggle: KAPALI (ilk test için)
```

#### Adımlar:
```
1. "Kayda Başla" butonuna tıkla
2. Chrome kaynak seçim penceresi açılmalı
3. "Current Tab" sekmesinde mevcut tab'ı seç
4. "Share" veya "Paylaş" butonuna tıkla
5. NanoCap popup'ını tekrar aç
6. Timer'ın çalıştığını kontrol et (00:01, 00:02, ...)
7. 10-15 saniye bekle
8. "Kaydı Durdur" butonuna tıkla
```

#### Beklenen Sonuç:
- ✅ Kaynak seçim diyalogu açılıyor
- ✅ Tab seçimi çalışıyor
- ✅ Timer başlıyor (00:01, 00:02, ...)
- ✅ "Kaydediyor" durumu görünüyor (kırmızı dot)
- ✅ Kayıt durdurulabiliyor
- ✅ İndirme penceresi açılıyor
- ✅ WebM dosyası indiriliyor

#### Dosya Kontrolü:
```bash
# İndirilen dosyayı kontrol et
cd ~/Downloads
ls -lh nanocap-recording-*.webm

# Dosya boyutu (10 saniye için):
# Dengeli quality: ~500 KB - 1.5 MB (beklenen)

# Dosyayı oynat
open nanocap-recording-*.webm
# QuickTime Player veya VLC ile açılmalı
```

---

### Test #3: FFmpeg Compression 🗜️ (15 dakika) - KRİTİK

**Amaç:** FFmpeg.wasm entegrasyonunun çalıştığını doğrula (%30-60 boyut azalma)

#### ⚠️ ÖNEMLI:
FFmpeg.wasm ilk kullanımda ~30 MB CDN'den indirir. İnternet bağlantısı gerekli!

#### Hazırlık:
```
1. NanoCap popup'ını aç
2. "FFmpeg Sıkıştırma" toggle'ını AÇ
3. Quality: "Dengeli"
4. Console'u aç (F12) → Console tab
```

#### Adımlar:
```
1. "Kayda Başla" → Current Tab seç → Share
2. YouTube video'yu oynat
3. 20-30 saniye kayıt yap
4. "Kaydı Durdur"
5. Console'da FFmpeg loglarını izle (önemli!)
6. İndirme tamamlanana kadar bekle
```

#### Console Logları (Beklenen):
```javascript
✅ "Requesting FFmpeg compression from offscreen document..."
✅ "Loading FFmpeg.wasm from CDN..."
✅ "[FFmpeg]: Opening 'input.webm' for reading"
✅ "[FFmpeg]: Stream mapping:"
✅ "[FFmpeg]: Progress: 15.23%" (ilerliyor)
✅ "[FFmpeg]: Progress: 100.00%"
✅ "FFmpeg compression successful"
✅ "Compressed size: XXX bytes, original: YYY bytes"
✅ "Compression ratio: XX%"
```

#### Dosya Boyutu Karşılaştırması:
```bash
# İlk test (FFmpeg OFF):
nanocap-recording-1234567890.webm → ~1.5 MB (30 saniye)

# İkinci test (FFmpeg ON):
nanocap-recording-1234567891.webm → ~600-900 KB (30 saniye)

# Beklenen azalma: %30-60
```

#### Sorun Giderme:
❌ **"Failed to fetch FFmpeg.wasm"**
- Çözüm: İnternet bağlantısını kontrol et
- CDN: unpkg.com erişilebilir olmalı

❌ **"FFmpeg compression failed"**
- Çözüm: Console'da detaylı hata mesajını kontrol et
- Fallback: Orijinal dosya indirilir (FFmpeg olmadan)

---

### Test #4: Ses Kalitesi 🎵 (5 dakika)

**Amaç:** Ses yakalanmasının çalıştığını doğrula

#### Adımlar:
```
1. YouTube'da MÜZİKLİ bir video aç
2. Volume'u orta seviyeye al
3. NanoCap ile 10 saniye kayıt yap
4. İndirilen dosyayı oynat
```

#### Beklenen Sonuç:
- ✅ Müzik/ses duyuluyor
- ✅ Senkronizasyon doğru (ses-video uyumlu)
- ✅ Ses kalitesi kabul edilebilir
- ✅ Kırılma/gecikme yok

---

### Test #5: Farklı Kalite Presetleri 📊 (10 dakika)

**Amaç:** Tüm kalite ayarlarının çalıştığını doğrula

#### Test Matrisi:
| Quality | Beklenen Boyut (30s) | Test Durumu |
|---------|---------------------|-------------|
| Ultra Düşük | ~500-800 KB | ⬜ |
| Düşük | ~900 KB - 1.2 MB | ⬜ |
| Dengeli | ~1.2-1.8 MB | ⬜ |
| Yüksek | ~2.5-4 MB | ⬜ |

#### Her preset için:
```
1. Quality'yi seç
2. 30 saniye kayıt yap
3. Dosya boyutunu kontrol et
4. Video kalitesini kontrol et (oyna)
```

---

### Test #6: Uzun Süre Kaydı ⏱️ (15 dakika)

**Amaç:** Uzun kayıtlarda stabilite ve memory leak kontrolü

#### Adımlar:
```
1. Chrome Task Manager'ı aç: chrome://task-manager/
2. "Browser" ve "Extension: NanoCap" satırlarını bul
3. NanoCap ile kayda başla
4. 5 dakika kayıt yap
5. Memory kullanımını izle
```

#### Beklenen Sonuç:
- ✅ Memory artışı kontrollü (<500 MB)
- ✅ CPU kullanımı %10-20 arası
- ✅ Kayıt sorunsuz tamamlanıyor
- ✅ Browser donmadan devam ediyor

#### Sorun İşaretleri:
❌ Memory 1 GB'ı geçiyor → Memory leak olabilir
❌ CPU %100'e çıkıyor → Performans sorunu
❌ Browser donuyor → Critical bug

---

### Test #7: Farklı Tab Senaryoları 🔄 (10 dakika)

**Amaç:** Farklı içerik tiplerinde kayıt stabilitesi

#### Test Edilecek Siteler:
```
1. ✅ YouTube (video)
2. ✅ Twitter/X (scroll)
3. ✅ GitHub (kod vurgulama)
4. ✅ Google Docs (dinamik içerik)
5. ✅ Google Maps (animasyon)
```

#### Her site için:
```
1. Site'yi aç
2. 15 saniye kayıt yap
3. İçeriği hareket ettir (scroll, zoom, vb.)
4. Kaydı durdur ve kontrol et
```

---

### Test #8: Hata Durumları ⚠️ (10 dakika)

**Amaç:** Edge case'lerde extension'ın nasıl davrandığını test et

#### Senaryo 1: Kaynak seçimi iptali
```
1. "Kayda Başla" → "Cancel" tıkla
2. Beklenen: Popup kapanıyor, hata mesajı yok
```

#### Senaryo 2: Kayıt sırasında tab kapatma
```
1. Kayda başla
2. Kaydedilen tab'ı kapat
3. Beklenen: Kayıt durur, hata mesajı gösterilir
```

#### Senaryo 3: Extension'ı yeniden yükleme
```
1. Kayıt sırasında: chrome://extensions/ → "Reload"
2. Beklenen: Kayıt durur, veri kaybı olabilir (kabul edilebilir)
```

#### Senaryo 4: DRM korumalı içerik
```
1. Netflix'te bir video kaydet
2. Beklenen: Siyah ekran (tarayıcı güvenliği)
```

---

## 🔍 Detaylı Console Kontrolleri

### Chrome DevTools'u Açma:
```
Yöntem 1: Sağ tıkla → "Inspect" (İncele)
Yöntem 2: Cmd + Option + I (Mac)
Yöntem 3: View → Developer → Developer Tools
```

### Service Worker Console:
```
1. chrome://extensions/ → NanoCap → "service worker"
2. DevTools açılır
3. Console tab'ında mesajları gör
```

### Beklenen Loglar (Normal Çalışma):
```javascript
✅ "NanoCap Service Worker initialized"
✅ "NanoCap Service Worker ready"
✅ "SW received message: START_RECORDING"
✅ "Starting recording with settings: {...}"
✅ "Offscreen document created successfully"
✅ "Recording started successfully"
✅ "SW received message: STOP_RECORDING"
✅ "Processing recording for download: XXXX bytes"
✅ "Download initiated: nanocap-recording-XXXXX.webm"
```

### Kritik Hatalar (Görmemen Gereken):
```javascript
❌ "Uncaught TypeError"
❌ "Cannot read property of undefined"
❌ "Failed to create offscreen document"
❌ "MediaRecorder is not defined"
❌ "Failed to start recording"
```

---

## 📊 Başarı Kriterleri

### Minimum Gereksinimler (Submission için):
- ✅ Test #1: Temel UI çalışıyor
- ✅ Test #2: Kayıt başlatılıp durduruluyor
- ✅ Test #3: FFmpeg compression çalışıyor
- ✅ Test #4: Ses yakalanıyor
- ✅ Dosyalar oynatılabiliyor

### Önerilen (Kalite için):
- ✅ Test #5: Tüm quality presetleri çalışıyor
- ✅ Test #6: 5 dakikalık kayıt sorunsuz
- ✅ Test #7: 5/5 site tipinde çalışıyor
- ✅ Test #8: 4/4 hata senaryosu doğru handle ediliyor

---

## 🐛 Sık Karşılaşılan Sorunlar

### Sorun 1: Extension yüklenmiyor
**Belirti:** "Load unpacked" sonrası hata mesajı

**Çözüm:**
```bash
# manifest.json kontrolü
cd ~/Desktop/NanoCap/dist
cat manifest.json | head -5

# Dosya izinleri
chmod -R 755 .
```

### Sorun 2: FFmpeg yüklenmiyor
**Belirti:** "Failed to fetch" veya "Network error"

**Çözüm:**
```bash
# 1. İnternet bağlantısını kontrol et
ping unpkg.com

# 2. Chrome network logs
# DevTools → Network tab → Reload extension
# unpkg.com isteklerini kontrol et

# 3. Alternatif: CSP kontrolü
# Console'da "Content Security Policy" hatası var mı?
```

### Sorun 3: Siyah ekran
**Belirti:** Kayıt edilen video siyah

**Muhtemel Sebepler:**
- ❌ DRM korumalı içerik (Netflix, Prime Video)
- ❌ Tab henüz yüklenmemiş
- ❌ Hardware acceleration kapalı

**Çözüm:**
```
1. chrome://settings/system
2. "Use hardware acceleration when available" → AÇ
3. Chrome'u yeniden başlat
```

### Sorun 4: Ses yok
**Belirti:** Video oynatılıyor ama ses yok

**Çözüm:**
```
1. NanoCap popup → "Ses" checkbox işaretli mi?
2. Chrome tab'da ses çalıyor mu? (tab icon'da ses göstergesi)
3. System audio çıkışı doğru mu?
4. Chrome → Site settings → Sound → Allow
```

---

## 📹 Video Dosya Kontrolleri

### Terminal'de dosya detayları:
```bash
cd ~/Downloads

# Dosya boyutu
ls -lh nanocap-recording-*.webm

# Video bilgileri (ffprobe gerekli)
ffprobe -v error -show_entries format=duration,size,bit_rate \
        -show_entries stream=codec_name,width,height,r_frame_rate \
        -of default=noprint_wrappers=1 nanocap-recording-*.webm

# Beklenen çıktı:
# codec_name=vp9
# codec_name=opus
# width=1920 (veya farklı)
# height=1080 (veya farklı)
```

### QuickTime ile kontrol:
```
1. Dosyaya sağ tıkla → Get Info
2. "More Info" bölümünde:
   - Kind: WebM video
   - Codec: VP9/Opus
   - Dimensions: XXX x YYY
   - Duration: doğru mu?
```

---

## 🎯 Test Raporu Şablonu

Test sonuçlarını kaydetmek için:

```markdown
# NanoCap v0.3.0 Test Raporu
**Test Tarihi:** 2025-11-06
**Platform:** Mac M4 Max, macOS 15.x
**Chrome Version:** XXX

## Test Sonuçları

| Test # | Senaryo | Durum | Notlar |
|--------|---------|-------|--------|
| 1 | Temel UI | ✅/❌ | |
| 2 | Ekran Kaydı | ✅/❌ | |
| 3 | FFmpeg | ✅/❌ | |
| 4 | Ses Kalitesi | ✅/❌ | |
| 5 | Quality Presets | ✅/❌ | |
| 6 | Uzun Kayıt | ✅/❌ | |
| 7 | Farklı Siteler | ✅/❌ | |
| 8 | Hata Durumları | ✅/❌ | |

## Performans Metrikleri
- CPU Kullanımı: ___%
- Memory Kullanımı: ___ MB
- Dosya Boyutu (30s, Dengeli): ___ MB
- FFmpeg Compression Oranı: ___%

## Bulunan Sorunlar
1.
2.
3.

## Öneriler
1.
2.
```

---

## ✅ Testi Başarıyla Tamamladınız mı?

### Sonraki Adımlar:

1. **Screenshot'ları Oluştur**
   ```bash
   open SCREENSHOT_GUIDE.md
   ```

2. **Chrome Web Store'a Submit Et**
   ```bash
   open FINAL_SUBMISSION_CHECKLIST.md
   ```

3. **Test sonuçlarını paylaş**
   - GitHub Issues'a bug raporu
   - Veya başarılı test sonuçlarını belge

---

## 🆘 Yardım ve Destek

**GitHub Issues:** https://github.com/lekesiz/NanoCap/issues
**Documentation:** COMPREHENSIVE_AUDIT_REPORT.md
**Manual Testing Guide:** MANUAL_TESTING_GUIDE.md

---

**Good luck! 🚀**
