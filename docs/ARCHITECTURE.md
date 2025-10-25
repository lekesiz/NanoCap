# NanoCap - Detaylı Mimari Dokümantasyonu

## 1. Genel Sistem Mimarisi

### 1.1 Manifest V3 Mimarisi

NanoCap, Google Chrome Manifest V3 standartlarını takip ederek modern güvenlik ve performans önerileri ile geliştirilmiştir.

```
┌──────────────────────────────────────────────────────────────┐
│                    CHROME UZANTISI (MV3)                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐         ┌──────────────────┐           │
│  │   Popup UI       │         │  Service Worker  │           │
│  │ (popup.html/js)  │◄────────┤   (sw.js)        │           │
│  │                  │ Events  │                  │           │
│  │ - Start/Stop     │◄────────┤ - Lifecycle      │           │
│  │ - Settings       │         │ - Messaging      │           │
│  │ - Quality Preset │         │ - TabCapture API │           │
│  └──────────────────┘         └────────┬─────────┘           │
│                                        │                      │
│                                        │ createDocument()     │
│                                        ▼                      │
│  ┌──────────────────────────────────────────────┐            │
│  │    Offscreen Document (offscreen.html/js)    │            │
│  │                                               │            │
│  │  ┌──────────────────────────────────────┐    │            │
│  │  │   MediaRecorder (VP9/Opus)           │    │            │
│  │  │  - getDisplayMedia() stream          │    │            │
│  │  │  - Real-time encoding                │    │            │
│  │  │  - Chunk collection                  │    │            │
│  │  └──────────────────────────────────────┘    │            │
│  │                                               │            │
│  │  ┌──────────────────────────────────────┐    │            │
│  │  │   Web Audio API (Ses Karışımı)       │    │            │
│  │  │  - System audio + Microphone         │    │            │
│  │  │  - Audio mirroring                   │    │            │
│  │  │  - MediaStreamDestination            │    │            │
│  │  └──────────────────────────────────────┘    │            │
│  │                                               │            │
│  │  ┌──────────────────────────────────────┐    │            │
│  │  │   FFmpeg.wasm (Advanced Mode)        │    │            │
│  │  │  - CRF-based re-encoding             │    │            │
│  │  │  - Format conversion                 │    │            │
│  │  │  - Runs in Web Worker                │    │            │
│  │  └──────────────────────────────────────┘    │            │
│  │                                               │            │
│  └──────────────────────────────────────────────┘            │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Bileşen Detayları

### 2.1 Service Worker (sw.js)

**Sorumlulukları:**
- Uzantının arka plan yaşam döngüsünü yönet
- Popup UI'dan mesajları al ve Offscreen Document'a ilet
- chrome.tabCapture API'sini kullanarak sekme akışı ID'sini al
- Offscreen Document'ın yaşam döngüsünü yönet

**Anahtar Fonksiyonlar:**

```javascript
// 1. Offscreen Document'ı başlat (gerekirse)
async function ensureOffscreen() {
  // Zaten aktif olan offscreen check et
  // Yoksa: chrome.offscreen.createDocument()
}

// 2. Kayıt başlat mesajını işle
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'START_RECORDING') {
    // Aktif sekmeyi al
    // TabCapture stream ID'sini al
    // Offscreen'e başlat mesajı gönder
  }
})

// 3. İndirme isteğini işle (Offscreen'den gelen)
if (msg.type === 'REC_EXPORT') {
  chrome.downloads.download({ url: dataUrl, filename })
}
```

**Manifest İzinleri:**
- `offscreen` - Offscreen document oluşturma
- `tabCapture` - Sekme medya akışı ID'si
- `downloads` - Dosya indirme
- `runtime` - Mesajlaşma

---

### 2.2 Popup UI (popup.html/js)

**Kullanıcı Arayüzü Bileşenleri:**

1. **Kalite Seçici:**
   - Küçük (720p@15fps, 900 kbps)
   - Standart (720p@24fps, 1.5 Mbps)
   - HD (1080p@30fps, 4 Mbps)
   - Sadece Ses (128 kbps)

2. **Ses Ayarları:**
   - Ses aynalama checkbox'ı

3. **Kontrol Düğmeleri:**
   - Başlat / Bitir

**popup.js Akışı:**

```javascript
// 1. Ön ayara göre seçenekleri belirle
const opts = getPresetOptions(preset)

// 2. Service Worker'a mesaj gönder
chrome.runtime.sendMessage({
  type: 'START_RECORDING',
  options: {
    vbps: videoBitrate,
    abps: audioBitrate,
    maxWidth: resolution,
    maxFps: fps,
    mirrorTabAudio: true/false
  }
})

// 3. UI'yı güncelle (enabled/disabled durumu)
```

---

### 2.3 Offscreen Document (offscreen.html/js)

**Bu bileşen NanoCap'in kalbidir. DOM'a erişim gerektiren tüm işlemler burada yapılır.**

#### **2.3.1 Aşama 1: MediaRecorder (Kayıt)**

```javascript
async function startRecording({ streamId, options }) {
  // 1. Sekme akışını getUserMedia ile al
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
        maxWidth: options.maxWidth,
        maxFrameRate: options.maxFps
      }
    }
  })

  // 2. Ses aynalaması (isteğe bağlı)
  if (options.mirrorTabAudio) {
    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(audioCtx.destination)
  }

  // 3. MIME tipini seç (MP4 destekliyse MP4, aksi WebM)
  const mimeType = chooseMimeType()

  // 4. MediaRecorder yapılandır
  const recorder = new MediaRecorder(stream, {
    mimeType: mimeType,
    videoBitsPerSecond: options.vbps,
    audioBitsPerSecond: options.abps
  })

  // 5. Veri parçalarını topla
  recorder.ondataavailable = (e) => chunks.push(e.data)
  
  // 6. Kayıt bittiğinde
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: mimeType })
    
    // Service Worker'a indirmeyi söyle
    chrome.runtime.sendMessage({
      type: 'REC_EXPORT',
      dataUrl: blobToDataURL(blob),
      filename: `nanocap_${Date.now()}.${extension}`
    })
  }

  recorder.start(1000) // 1 saniyeli chunk'lar
}
```

#### **2.3.2 MIME Tipi Seçimi**

```javascript
function pickMimeType() {
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', // H.264 + AAC (Chromium 126+)
    'video/mp4',                                 // Genel MP4
    'video/webm;codecs=vp9,opus',               // VP9 + Opus
    'video/webm;codecs=vp8,opus',               // VP8 + Opus (fallback)
    'video/webm'                                 // Genel WebM
  ]
  
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return 'video/webm' // Ultimate fallback
}
```

---

### 2.4 FFmpeg.wasm İntegrasyonu (Gelişmiş Mod)

**Not:** Mevcut v0.2.0'da temeldir; v0.3.0'da geliştirilecektir.

**Tasarım:**
```javascript
// Web Worker'da çalıştırılacak
self.onmessage = async (e) => {
  const { blob, options } = e.data
  
  // FFmpeg.wasm'a blob'u aktar
  const ffmpeg = FFmpeg.createFFmpeg()
  await ffmpeg.load()
  
  // Giriş dosyasını yaz
  ffmpeg.FS('writeFile', 'input.webm', await blob.arrayBuffer())
  
  // CRF ile yeniden kodla
  await ffmpeg.run(
    '-i', 'input.webm',
    '-c:v', 'libvp9',
    '-crf', '35',       // Kalite faktörü
    '-c:a', 'libopus',
    '-b:a', '64k',
    'output.webm'
  )
  
  // Çıkış dosyasını oku
  const output = ffmpeg.FS('readFile', 'output.webm')
  const outputBlob = new Blob([output.buffer])
  
  // Ana thread'e geri gönder
  self.postMessage({ result: outputBlob })
}
```

---

## 3. Veri Akışı

### 3.1 Kayıt Başlatma Akışı

```
┌──────────────┐
│  Popup UI    │
│ "Başlat" btn │
└──────┬───────┘
       │
       │ chrome.runtime.sendMessage()
       ▼
┌──────────────────────────┐
│   Service Worker         │
│ START_RECORDING msg      │
└──────┬───────────────────┘
       │
       ├─ ensureOffscreen()
       │  (Offscreen Doc oluştur)
       │
       ├─ getDisplayMedia() (Seç: Sekme/Pencere/Ekran)
       │
       └─ tabCapture.getMediaStreamId()
           │
           │ streamId
           ▼
┌──────────────────────────┐
│  Offscreen Document      │
│ REC_START msg + streamId │
└──────┬───────────────────┘
       │
       ├─ getUserMedia(chromeMediaSource:tab)
       │
       ├─ Audio Context (Ses karışımı)
       │
       └─ MediaRecorder başlat
           │
           └─ Blob chunks topla
```

### 3.2 Kayıt Bitirme Akışı

```
┌──────────────┐
│  Popup UI    │
│ "Bitir" btn  │
└──────┬───────┘
       │
       │ chrome.runtime.sendMessage()
       ▼
┌──────────────────────────┐
│   Service Worker         │
│ STOP_RECORDING msg       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Offscreen Document      │
│ REC_STOP msg             │
└──────┬───────────────────┘
       │
       ├─ recorder.stop()
       │
       ├─ Blob oluştur
       │
       └─ blobToDataURL()
           │
           │ data:// URL
           ▼
┌──────────────────────────┐
│   Service Worker         │
│ REC_EXPORT msg + dataUrl │
└──────┬───────────────────┘
       │
       └─ chrome.downloads.download()
           │
           └─ Kullanıcı indirme diyalogu
```

---

## 4. Optimizasyon Tekniği Detayları

### 4.1 VP9 Codec Optimizasyonu

**VP9 neden seçildi:**
- Düşük bit hızlarında H.264'ten %20-30 daha iyi sıkıştırma
- WebM konteyner içinde özellikleri tam desteklenir
- Chrome'un native desteği

**Hedef Bit Hızları:**
| Senaryo | Çözünürlük | FPS | Video BR | Ses BR | Başvuru |
|---------|-----------|-----|----------|--------|---------|
| Ekran Kaydı | 1280x720 | 15 | 900 kbps | 96 kbps | Sunumlar, Ekran Paylaşımı |
| Sunumlar | 1280x720 | 24 | 1.2 Mbps | 96 kbps | SlideShare |
| Müzik/Video | 1920x1080 | 30 | 4 Mbps | 128 kbps | YouTube (Kalite) |

### 4.2 Opus Ses Codec Optimizasyonu

**Opus Avantajları:**
- 6 kbps ile 510 kbps arasında kalite: mükemmel esneklik
- 64-96 kbps: İnsan konuşması için mükemmel kalite
- 32 kbps: Kabul edilebilir kalite (uydu ses)

### 4.3 CRF (Constant Rate Factor) Stratejisi

**Standart CBR vs CRF:**

| Metrik | CBR | CRF |
|--------|-----|-----|
| Bit Hızı | Sabit | Değişken |
| Kalite | Değişken | Sabit |
| Basit Sahneler | Fazla Bitler | Daha az bitler |
| Karmaşık Sahneler | Eksik Bitler | Daha fazla bitler |
| Dosya Boyutu | Öngörülebilir | Değişken (ortalama küçük) |
| **Verimliliği** | **Orta** | **Yüksek** |

**NanoCap CRF Stratejisi:**
```
CRF 30: Çoğu senaryo, müzik videolar, filmler
CRF 35: Ekran kayıtları, sunumlar (en çok kullanılan)
CRF 40: Maksimum sıkıştırma (Konuşmacı video)
CRF 45: Minimum kalite (İstatistik)
```

---

## 5. İzin Mimarisi

### 5.1 Kullanılan İzinler

```json
{
  "permissions": [
    "offscreen",      // Offscreen document oluşturma
    "tabCapture",     // Sekme video/ses yakala
    "downloads",      // Dosya indir
    "storage",        // Ayarları sakla
    "activeTab",      // Aktif sekmeyi tespit et
    "scripting"       // İleri özellikler (gelecek)
  ],
  "host_permissions": [
    "<all_urls>"      // Tüm sitelerde çalış (önerilir)
  ]
}
```

### 5.2 İzin Haklama

| İzin | Neden Gerekli | Güvenlik Notu |
|------|---------------|--------------|
| `offscreen` | MediaRecorder ve DOM API'leri | Kullanıcı izni gerekli (manifest) |
| `tabCapture` | Sekme akışı | Kullanıcı geste gerekli (Chrome zorunluluğu) |
| `downloads` | Dosya indirme | Güvenli, yerel işlem |
| `storage` | Ayar sakla | Lokal, veri yok |
| `activeTab` | Hangi sekmede olunduğu | Minimal bilgi |

---

## 6. Hata Yönetimi

### 6.1 Beklenen Hatalar

```javascript
// 1. MediaRecorder başlama hatası
try {
  recorder.start(1000)
} catch (e) {
  console.error('MediaRecorder başlama hatası:', e)
  // UI'da kullanıcıya uyar
}

// 2. TabCapture stream ID hatası
try {
  const streamId = await chrome.tabCapture.getMediaStreamId(...)
} catch (e) {
  console.error('TabCapture hatası:', e)
  // Yeniden denemesini iste
}

// 3. getUserMedia izin hatası
try {
  const stream = await navigator.mediaDevices.getUserMedia(...)
} catch (e) {
  if (e.name === 'NotAllowedError') {
    // Kullanıcı reddetti
  } else if (e.name === 'NotFoundError') {
    // Cihaz bulunamadı
  }
}
```

---

## 7. Performans Hedefleri

| Metrik | Hedef | Not |
|--------|-------|-----|
| **CPU Kullanımı (720p@15)** | < 15% | Ortalama sistem |
| **RAM Kullanımı (1 saat)** | < 500 MB | İndekslenmiş DB ile |
| **Kayıt Başlama Süresi** | < 2 sn | User gesture sonrası |
| **FFmpeg İşlemi (30 dk)** | < 5 dakika | Mid-range CPU, Worker'da |
| **Ses/Video Senkronizasyonu** | < 100 ms | Fark gözlemlenebilir değil |

---

## 8. Güvenlik Mimarisi

### 8.1 Veri Akışı Güvenliği

```
[GÜVENLI BÖLGE]
    ↓
Kullanıcı Bilgisayarı
    ↓
[Tarayıcı Sandbox]
    ↓
[Uzantı Konteksti]
    ├─ Service Worker (Sandbox)
    └─ Offscreen Document (Sandbox)
    ↓
[Yerel Dosya Sistemi]
    ↓
Kullanıcının Downloads Klasörü
    ↓
[DOSYA SADECE KULLANICIDIR]
```

### 8.2 Manifest V3 Güvenliği

- ✅ **Content Security Policy (CSP):** Sınırlandırılmış
- ✅ **Sandboxing:** Uzantı içeriği sandboxlanmış
- ✅ **Cross-Origin:** Yalnızca belirlenen URLs
- ✅ **Service Worker İzolasyonu:** DOM yok, API sınırlı

---

## 9. Ölçeklenebilirlik

### 9.1 Uzun Kayıtlar (Gelecek)

**Sorun:** Blob'ları RAM'de tutmak sınırsız değildir

**Çözüm (v0.3.0+):**
```javascript
// IndexedDB kullan
const db = await openDatabase('NanoCap')
const store = db.transaction('chunks', 'readwrite').objectStore('chunks')

recorder.ondataavailable = async (e) => {
  await store.add({ timestamp: Date.now(), chunk: e.data })
}
```

### 9.2 File System Access API (Gelişmiş)

```javascript
// Akış yazması - Bellek tasarrufu
const handle = await showSaveFilePicker()
const writable = await handle.createWritable()

recorder.ondataavailable = async (e) => {
  await writable.write(e.data)
}
```

---

## 10. Test Matrisi

### 10.1 Birim Testler

- [ ] MIME tipi seçimi (MP4 vs WebM)
- [ ] Bit hızı hesaplamaları
- [ ] Ses karışım mantığı
- [ ] Blob'dan Data URL dönüşümü

### 10.2 İntegrasyon Testleri

- [ ] Kayıt başlat → Bitir → İndir
- [ ] Ön ayar değişiklikleri
- [ ] Ses aynalama açık/kapalı
- [ ] Pop-up kapatma sırasında kayıt devamı

### 10.3 Performans Testleri

- [ ] CPU kullanımı ölçümü
- [ ] RAM kullanımı (30 dakika, 1 saat)
- [ ] Ses/Video senkronizasyonu
- [ ] FFmpeg işlem süresi

---

## 11. Gelecek Mimari Planları

### v0.3.0: Akış Yazması
- File System Access API
- IndexedDB buffer
- Parçalı kayıt

### v0.4.0: Gelişmiş Codecler
- AV1 desteği
- HEVC (varsa)
- Donanım hızlandırma

### v0.5.0: Uzman Özellikleri
- Otomatik dosya bölme
- Zamanlı kayıt
- Ses normalizasyonu

---

**Son Güncelleme:** 2025-01-25
**Sürüm:** 0.2.0
**Durum:** Aktif Geliştirme
