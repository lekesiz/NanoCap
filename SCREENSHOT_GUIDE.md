# 📸 NanoCap - Screenshot ve Promosyon Materyali Kılavuzu

**Chrome Web Store Gereksinimleri**
**Hazırlayan:** Claude AI
**Tarih:** 6 Kasım 2025

---

## 📋 Chrome Web Store Görsel Gereksinimleri

### Zorunlu Görseller

#### 1. Screenshot'lar (1-5 adet)
```
Format: PNG veya JPEG
Boyut: 1280x800 veya 640x400
Min: 640x400
Max: 1280x800
Oran: 16:10 (tavsiye)
Dosya: Max 2 MB
Adet: En az 1, en fazla 5
```

#### 2. Promo Tile (Küçük - Opsiyonel)
```
Boyut: 440x280 px
Format: PNG
Kullanım: Chrome Web Store arama sonuçları
```

#### 3. Promo Tile (Büyük - Opsiyonel ama Tavsiye)
```
Boyut: 920x680 px
Format: PNG
Kullanım: Featured listing, öne çıkan yerler
```

#### 4. Marquee (Çok Büyük - Opsiyonel)
```
Boyut: 1400x560 px
Format: PNG
Kullanım: Editor's choice, highlight
```

---

## 📸 Gerekli Screenshot'lar (Öncelik Sırasıyla)

### Screenshot #1: Ana Popup Arayüzü (ZORUNLU)
**Öncelik:** 🔴 Yüksek

**İçerik:**
```
✓ Popup açık (varsayılan görünüm)
✓ Tüm ayarlar görünür
✓ "Kaydı Başlat" butonu göze çarpıyor
✓ Kalite seçenekleri açık
✓ FFmpeg checkbox görünür
✓ Bilgi paneli (dosya boyutu, sıkıştırma, CPU)
✓ Clean, profesyonel görünüm
```

**Nasıl Alınır:**
```
1. Extension popup'ı aç
2. Kalite: "Dengeli" seç
3. Tüm checkbox'lar varsayılan konumda
4. Screenshot al (tavsiye: Snipping Tool veya Cmd+Shift+4 Mac'te)
5. Boyutlandır: 1280x800
```

**Dosya Adı:** `screenshot-1-main-popup.png`

**Açıklama Metni (Store'da):**
```
"NanoCap ana arayüzü - Kolay kullanım, güçlü özellikler"
veya
"Sezgisel arayüz ile 4 kalite seviyesi ve gelişmiş sıkıştırma seçenekleri"
```

---

### Screenshot #2: Kayıt Sırasında (ZORUNLU)
**Öncelik:** 🔴 Yüksek

**İçerik:**
```
✓ Popup açık
✓ Status: "Kaydediyor" (kırmızı dot)
✓ Timer çalışıyor (örn: 00:15)
✓ "Kaydı Durdur" butonu görünür
✓ Recording indicator aktif
```

**Nasıl Alınır:**
```
1. Kaydı başlat
2. 10-15 saniye bekle
3. Popup'ı aç
4. Screenshot al
5. Kaydı durdur
```

**Dosya Adı:** `screenshot-2-recording-active.png`

**Açıklama Metni:**
```
"Canlı kayıt - Gerçek zamanlı timer ve durum göstergesi"
veya
"Kayıt sırasında: Anlık kontrol ve kolayca durdurma"
```

---

### Screenshot #3: FFmpeg Sıkıştırma Progress (ÖNEMLİ)
**Öncelik:** 🟡 Orta-Yüksek

**İçerik:**
```
✓ Progress bar görünür
✓ "İşleniyor..." mesajı
✓ Progress yüzdesi (örn: 45%)
✓ Compression info gösteriliyor
```

**Nasıl Alınır:**
```
1. FFmpeg açık olarak kayıt yap
2. Kaydı durdur
3. FFmpeg başladığında popup'ı aç
4. Progress sırasında screenshot al (HIZLI OL!)
```

**Not:** FFmpeg hızlı çalışırsa, console'dan screenshot alabilirsin.

**Dosya Adı:** `screenshot-3-ffmpeg-progress.png`

**Açıklama Metni:**
```
"Gelişmiş FFmpeg.wasm sıkıştırma - %30-60 ek dosya boyutu azaltma"
veya
"İşlem sonrası akıllı sıkıştırma ile ultra düşük dosya boyutları"
```

---

### Screenshot #4: Kalite Karşılaştırması (TAVSİYE)
**Öncelik:** 🟢 Orta

**İçerik:**
```
Split screen veya yan yana:
Sol: Dosya boyutu ÖNCESİ (örn: 5.2 MB)
Sağ: Dosya boyutu SONRASI (örn: 2.1 MB)

✓ Dosya özellikleri görünür
✓ Boyut farkı vurgulanmış
✓ "%60 azalma" gibi badge
```

**Nasıl Alınır:**
```
1. Aynı kaydı iki kez yap (FFmpeg açık/kapalı)
2. Dosya özelliklerini aç (Windows Explorer veya Finder)
3. İki pencereyi yan yana koy
4. Screenshot al
5. (Opsiyonel) Photoshop/Figma'da beautify et
```

**Dosya Adı:** `screenshot-4-size-comparison.png`

**Açıklama Metni:**
```
"Gerçek dünya örneği: %60 dosya boyutu tasarrufu, kalite kaybı yok"
```

---

### Screenshot #5: Ayarlar ve Özellikler (İSTEĞE BAĞLI)
**Öncelik:** 🟢 Düşük

**İçerik:**
```
✓ Kalite presets açılmış
✓ Tooltip'ler görünür
✓ Advanced features bölümü
✓ Codec bilgileri
```

**Dosya Adı:** `screenshot-5-settings-detailed.png`

---

## 🎨 Promo Tile Tasarım Önerileri

### Küçük Tile (440x280)

**Tasarım Öğeleri:**
```
Logo/Icon: Sol üstte NanoCap icon
Başlık: "NanoCap"
Tagline: "Ultra Düşük Boyutlu Kayıt"
Özellik: "VP9 | FFmpeg | %60 Azalma"
Renk: Mavi-Yeşil gradient (profesyonel)
Font: Modern, okunabilir (Roboto, Inter, vb.)
```

**Figma/Canva Template:**
```
Background: Solid color veya subtle gradient
Icon: 64x64 px (sol üst)
Title: 32px, bold
Subtitle: 16px, regular
Feature badges: 12px, rounded rectangles
```

### Büyük Tile (920x680) - TAVSİYE

**Tasarım Öğeleri:**
```
Hero Image: Screenshot #1 (popup) sağ tarafta
Sol taraf:
  - Logo büyük
  - Başlık: "NanoCap - Screen Recorder"
  - Tagline: "Record your screen, save your space"
  - Key features:
    ✓ %60 smaller files
    ✓ FFmpeg.wasm compression
    ✓ VP9 codec
    ✓ 100% private
  - CTA: "Add to Chrome - FREE"
```

---

## 🖼️ Screenshot Checklist

### Teknik Kontroller
```
□ Boyut: 1280x800 px (her screenshot için)
□ Format: PNG (yüksek kalite)
□ Dosya boyutu: <2 MB
□ DPI: 72 (web için yeterli)
□ Renk profili: sRGB
□ Sıkıştırma: Lossless
```

### İçerik Kontrolleri
```
□ UI temiz ve profesyonel
□ Font'lar okunabilir
□ Icon'lar net
□ Gölgeler/efektler abartısız
□ Background clean
□ Watermark YOK
□ Personal info YOK (klasör isimleri, vb.)
□ Dev tools console KAPALI
□ Browser URL bar temiz (extension URL göstermiyor)
```

### Sıra Önerisi (Store'da)
```
1. screenshot-1-main-popup.png (İlk izlenim)
2. screenshot-2-recording-active.png (Kullanım)
3. screenshot-3-ffmpeg-progress.png (Özellik vurgusu)
4. screenshot-4-size-comparison.png (Sonuç gösterimi)
5. screenshot-5-settings-detailed.png (Detaylar)
```

---

## 🎨 Design System (Opsiyonel - Promo Görseller için)

### Renk Paleti
```
Primary: #2563EB (Mavi)
Secondary: #10B981 (Yeşil)
Accent: #F59E0B (Turuncu)
Background: #FFFFFF
Text: #1F2937
Secondary Text: #6B7280
```

### Typography
```
Heading: Inter/Roboto Bold, 32-48px
Subheading: Inter/Roboto Medium, 24-32px
Body: Inter/Roboto Regular, 16-20px
Caption: Inter/Roboto Regular, 12-14px
```

### Spacing
```
Padding: 16px, 24px, 32px
Margin: 8px, 16px, 24px
Border Radius: 8px, 12px, 16px
```

---

## 🛠️ Screenshot Araçları

### Windows
```
✓ Snipping Tool (Windows 10/11)
✓ Greenshot (ücretsiz, profesyonel)
✓ ShareX (ücretsiz, advanced)
✓ LightShot (ücretsiz, basit)
```

### Mac
```
✓ Cmd+Shift+4 (built-in)
✓ Cmd+Shift+5 (screen record + screenshot)
✓ CleanShot X (paid, profesyonel)
✓ Monosnap (ücretsiz)
```

### Linux
```
✓ Flameshot (ücretsiz, güçlü)
✓ GNOME Screenshot
✓ Spectacle (KDE)
```

### Browser Extensions
```
✓ Awesome Screenshot
✓ Full Page Screen Capture
✓ Fireshot
```

### Editing Tools
```
✓ Figma (ücretsiz, web-based)
✓ Canva (ücretsiz, template'ler)
✓ GIMP (ücretsiz, Photoshop alternative)
✓ Photoshop (paid)
✓ Sketch (Mac, paid)
```

---

## 📐 Screenshot Post-Processing

### Adım 1: Resize
```bash
# ImageMagick ile:
convert screenshot.png -resize 1280x800! screenshot-resized.png

# Veya online tool:
https://www.resizeimage.net/
```

### Adım 2: Optimize
```bash
# PNG optimize:
pngquant screenshot.png --output screenshot-optimized.png

# Veya online:
https://tinypng.com/
```

### Adım 3: Quality Check
```
□ Boyut doğru mu? (1280x800)
□ Text okunuyor mu?
□ Renkler doğru mu?
□ Artifacts var mı?
□ Dosya boyutu <2MB mı?
```

---

## ✅ Final Checklist

### Screenshot'lar Hazır
```
□ screenshot-1-main-popup.png (1280x800, <2MB)
□ screenshot-2-recording-active.png (1280x800, <2MB)
□ screenshot-3-ffmpeg-progress.png (1280x800, <2MB)
□ screenshot-4-size-comparison.png (1280x800, <2MB) [opsiyonel]
□ screenshot-5-settings-detailed.png (1280x800, <2MB) [opsiyonel]
```

### Promo Görseller Hazır (Opsiyonel)
```
□ promo-tile-small.png (440x280)
□ promo-tile-large.png (920x680)
□ marquee-promo.png (1400x560) [very optional]
```

### Klasör Yapısı
```
chrome-store-assets/
├── screenshots/
│   ├── screenshot-1-main-popup.png
│   ├── screenshot-2-recording-active.png
│   ├── screenshot-3-ffmpeg-progress.png
│   ├── screenshot-4-size-comparison.png
│   └── screenshot-5-settings-detailed.png
├── promo/
│   ├── promo-tile-small.png
│   └── promo-tile-large.png
└── README.md (bu dosya)
```

---

## 🚀 Sonraki Adım

Screenshot'lar hazır olunca:
```
✅ Chrome Web Store listing'e upload et
✅ Her screenshot için açıklayıcı text yaz
✅ Sırasını optimize et (en iyi ilk)
✅ Preview kontrolü yap
✅ Save draft / Publish
```

---

## 💡 Pro Tips

### Tip #1: Tutarlılık
```
Tüm screenshot'lar aynı kalite preset'ini göstermeli (Dengeli tavsiye)
Aynı window size kullan
Aynı theme (light/dark) kullan
```

### Tip #2: Story Telling
```
Screenshot'lar bir hikaye anlatmalı:
1. Bu ne? (Ana arayüz)
2. Nasıl kullanılır? (Kayıt sırasında)
3. Faydası ne? (FFmpeg, boyut karşılaştırma)
4. Detaylar (Ayarlar)
```

### Tip #3: Quality Over Quantity
```
5 mediocre screenshot < 3 mükemmel screenshot
En iyi 3'ünü kullan, geri kalanını sakla
```

### Tip #4: Real Usage
```
Fake data kullanma
Gerçek kayıtları göster
Gerçek dosya boyutlarını göster
```

### Tip #5: Annotations (Dikkatli kullan)
```
✓ Ok işaretleri (önemli özelliklere)
✓ Highlight box'lar (vurgulamak için)
✗ Aşırı annotation (karmaşık görünür)
✗ Comic Sans (lütfen hayır)
```

---

**Screenshot'lar Hazır mı?**
□ EVET - Chrome Web Store listing'e geç
□ HAYIR - Screenshot'ları al ve optimize et

---

*NanoCap v0.3.0 - Screenshot Kılavuzu*
*Chrome Web Store submission için*
*Hazırlayan: Claude AI*
*Tarih: 6 Kasım 2025*
