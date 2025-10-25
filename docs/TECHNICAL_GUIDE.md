# NanoCap - Teknik Rehber

## Geliştirici Dokümantasyonu

Bu dokümantasyon, NanoCap projesinin teknik detaylarını, geliştirme süreçlerini ve katkıda bulunma rehberini içerir.

---

## 📋 İçindekiler

- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Proje Yapısı](#proje-yapısı)
- [Kod Standartları](#kod-standartları)
- [Test Stratejisi](#test-stratejisi)
- [Debugging](#debugging)
- [Build ve Deploy](#build-ve-deploy)
- [Katkıda Bulunma](#katkıda-bulunma)

---

## 🛠️ Geliştirme Ortamı

### Gereksinimler

- **Chrome/Chromium:** 116+ (MP4 desteği için) veya 110+ (WebM için)
- **Node.js:** 16+ (gelecekteki build araçları için)
- **Git:** 2.0+
- **VS Code:** Önerilen IDE

### Kurulum

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/lekesiz/NanoCap.git
   cd NanoCap
   ```

2. **Chrome'da Developer Mode'u açın:**
   - `chrome://extensions` → Developer mode ON
   - "Load unpacked" → Proje klasörünü seç

3. **Test edin:**
   - Uzantı ikonuna tıklayın
   - Console'u açın (`F12`)
   - Kayıt başlatmayı test edin

---

## 📁 Proje Yapısı

```
NanoCap/
├── manifest.json              # Chrome uzantı konfigürasyonu
├── sw.js                      # Service Worker (ana koordinatör)
├── popup.html                 # Kullanıcı arayüzü (HTML)
├── popup.js                   # Popup mantığı ve UI kontrolü
├── popup.css                  # Popup stilleri
├── offscreen.html             # Offscreen document (boş HTML)
├── offscreen.js               # MediaRecorder ve kayıt mantığı
├── docs/                      # Dokümantasyon
│   ├── ARCHITECTURE.md        # Detaylı mimari
│   ├── TECHNICAL_GUIDE.md     # Bu dosya
│   └── FAQ.md                 # Sık sorulan sorular
├── README.md                  # Ana README
├── LICENSE                    # MIT Lisansı
└── .gitignore                 # Git ignore kuralları
```

### Dosya Sorumlulukları

| Dosya | Sorumluluk | Teknoloji |
|-------|-----------|-----------|
| `manifest.json` | Uzantı metadata, izinler | JSON |
| `sw.js` | Arka plan koordinasyonu | Chrome APIs |
| `popup.html/js/css` | Kullanıcı arayüzü | HTML/CSS/JS |
| `offscreen.html/js` | Kayıt işlemleri | Web APIs |

---

## 📝 Kod Standartları

### JavaScript Konvansiyonları

```javascript
// 1. Async/await kullanımı
async function startRecording(options) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(options)
    // ...
  } catch (error) {
    console.error('Recording failed:', error)
    throw error
  }
}

// 2. Error handling
function handleError(error, context) {
  console.error(`[${context}] Error:`, error)
  
  // Kullanıcıya bildir
  chrome.runtime.sendMessage({
    type: 'ERROR',
    error: error.message,
    context: context
  })
}

// 3. Constants tanımlama
const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  ERROR: 'error'
}

// 4. Event listener cleanup
function cleanup() {
  if (recorder) {
    recorder.ondataavailable = null
    recorder.onstop = null
    recorder = null
  }
}
```

### CSS Konvansiyonları

```css
/* 1. BEM metodolojisi */
.recording-controls__button {
  /* Ana element */
}

.recording-controls__button--primary {
  /* Modifier */
}

.recording-controls__button--disabled {
  /* State */
}

/* 2. CSS Custom Properties */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --error-color: #f44336;
  --success-color: #4caf50;
}

/* 3. Responsive design */
@media (max-width: 400px) {
  .container {
    width: 100%;
    padding: 8px;
  }
}
```

### Chrome Extension Konvansiyonları

```javascript
// 1. Message passing pattern
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_RECORDING':
      handleStartRecording(message.data)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true // Async response
      
    case 'STOP_RECORDING':
      handleStopRecording()
      sendResponse({ success: true })
      break
  }
})

// 2. Permission checking
async function checkPermissions() {
  const permissions = await chrome.permissions.getAll()
  return {
    hasOffscreen: permissions.permissions.includes('offscreen'),
    hasTabCapture: permissions.permissions.includes('tabCapture'),
    hasDownloads: permissions.permissions.includes('downloads')
  }
}

// 3. Storage usage
async function saveSettings(settings) {
  await chrome.storage.sync.set({ settings })
}

async function loadSettings() {
  const result = await chrome.storage.sync.get(['settings'])
  return result.settings || getDefaultSettings()
}
```

---

## 🧪 Test Stratejisi

### Manuel Test Senaryoları

#### 1. Temel Fonksiyonalite
- [ ] Uzantı yüklenir ve popup açılır
- [ ] Kalite ön ayarları çalışır
- [ ] Kayıt başlat/durdur çalışır
- [ ] Dosya indirme çalışır

#### 2. Kalite Testleri
- [ ] Küçük kalite (720p@15) → ~900 kbps
- [ ] Standart kalite (720p@24) → ~1.5 Mbps
- [ ] HD kalite (1080p@30) → ~4 Mbps
- [ ] Sadece ses → ~128 kbps

#### 3. Format Testleri
- [ ] MP4 formatı (Chrome 126+)
- [ ] WebM formatı (fallback)
- [ ] Ses aynalama çalışması

#### 4. Edge Cases
- [ ] Popup kapatma sırasında kayıt devamı
- [ ] Sekme değiştirme sırasında kayıt
- [ ] Uzun kayıtlar (30+ dakika)
- [ ] DRM korumalı içerik (siyah ekran)

### Otomatik Testler (Gelecek)

```javascript
// Jest test örneği (gelecek)
describe('MediaRecorder Configuration', () => {
  test('should select optimal MIME type', () => {
    const mimeType = pickMimeType()
    expect(MediaRecorder.isTypeSupported(mimeType)).toBe(true)
  })
  
  test('should calculate correct bitrates', () => {
    const options = getPresetOptions('small')
    expect(options.vbps).toBe(900000)
    expect(options.abps).toBe(96000)
  })
})
```

---

## 🐛 Debugging

### Chrome DevTools Kullanımı

#### 1. Service Worker Debugging
```javascript
// sw.js içinde
console.log('Service Worker started')
chrome.runtime.onMessage.addListener((msg) => {
  console.log('SW received:', msg.type, msg)
})
```

**Debugging Adımları:**
1. `chrome://extensions` → NanoCap → "Inspect views: service worker"
2. Console'da logları takip edin
3. Network tab'da mesajlaşmayı izleyin

#### 2. Offscreen Document Debugging
```javascript
// offscreen.js içinde
console.log('Offscreen document loaded')
console.log('MediaRecorder supported:', !!window.MediaRecorder)
```

**Debugging Adımları:**
1. Service Worker console'unda offscreen context'i inspect edin
2. MediaRecorder API'sini test edin
3. Stream durumunu kontrol edin

#### 3. Popup Debugging
```javascript
// popup.js içinde
console.log('Popup loaded')
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM ready')
})
```

**Debugging Adımları:**
1. Popup'ı açın
2. Sağ tık → "Inspect" (veya F12)
3. Console'da UI etkileşimlerini takip edin

### Debugging Araçları

#### 1. Chrome Extension APIs
```javascript
// Runtime bilgileri
console.log('Extension ID:', chrome.runtime.id)
console.log('Manifest:', chrome.runtime.getManifest())

// Permission kontrolü
chrome.permissions.getAll().then(perms => {
  console.log('Permissions:', perms)
})

// Storage kontrolü
chrome.storage.sync.get(null).then(items => {
  console.log('Storage:', items)
})
```

#### 2. MediaRecorder Debugging
```javascript
// MediaRecorder durumu
if (recorder) {
  console.log('Recorder state:', recorder.state)
  console.log('MIME type:', recorder.mimeType)
  console.log('Video bitrate:', recorder.videoBitsPerSecond)
  console.log('Audio bitrate:', recorder.audioBitsPerSecond)
}
```

#### 3. Stream Debugging
```javascript
// Stream bilgileri
if (stream) {
  console.log('Stream tracks:', stream.getTracks().length)
  stream.getTracks().forEach((track, index) => {
    console.log(`Track ${index}:`, {
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState
    })
  })
}
```

---

## 🚀 Build ve Deploy

### Development Build

```bash
# 1. Proje klasörünü hazırla
cd NanoCap

# 2. Chrome'da test et
# chrome://extensions → Load unpacked → klasörü seç

# 3. Değişiklikleri test et
# Kod değişikliği → Reload extension → Test
```

### Production Build (Gelecek)

```bash
# 1. Build script'i çalıştır
npm run build

# 2. ZIP dosyası oluştur
npm run package

# 3. Chrome Web Store'a yükle
# chrome://extensions → Pack extension
```

### Version Management

```json
// manifest.json
{
  "version": "0.2.0",
  "version_name": "0.2.0-beta"
}
```

**Semantic Versioning:**
- `MAJOR.MINOR.PATCH`
- `0.2.0` → `0.2.1` (bug fix)
- `0.2.0` → `0.3.0` (yeni özellik)
- `0.2.0` → `1.0.0` (major release)

---

## 🤝 Katkıda Bulunma

### Pull Request Süreci

1. **Fork ve Clone:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/NanoCap.git
   cd NanoCap
   ```

2. **Branch Oluştur:**
   ```bash
   git checkout -b feature/yeni-ozellik
   # veya
   git checkout -b fix/bug-duzeltme
   ```

3. **Değişiklikleri Yap:**
   - Kod standartlarına uy
   - Test et
   - Dokümantasyonu güncelle

4. **Commit ve Push:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   git push origin feature/yeni-ozellik
   ```

5. **Pull Request Aç:**
   - GitHub'da PR aç
   - Açıklayıcı başlık ve açıklama yaz
   - Test sonuçlarını ekle

### Commit Message Konvansiyonları

```
type(scope): description

feat(popup): add quality preset selector
fix(offscreen): resolve audio sync issue
docs(readme): update installation guide
refactor(sw): optimize message handling
test(recording): add unit tests for MIME detection
```

**Types:**
- `feat`: Yeni özellik
- `fix`: Bug düzeltme
- `docs`: Dokümantasyon
- `refactor`: Kod düzenlemesi
- `test`: Test ekleme
- `chore`: Maintenance

### Code Review Checklist

- [ ] Kod standartlarına uygun mu?
- [ ] Error handling var mı?
- [ ] Console.log'lar temizlendi mi?
- [ ] Dokümantasyon güncellendi mi?
- [ ] Test edildi mi?
- [ ] Performance etkisi değerlendirildi mi?

---

## 📚 Kaynaklar

### Chrome Extension Development
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [Chrome APIs Reference](https://developer.chrome.com/docs/extensions/reference/)

### Web APIs
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

### Video Codecs
- [VP9 Codec](https://www.webmproject.org/vp9/)
- [Opus Audio Codec](https://opus-codec.org/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

---

**Son Güncelleme:** 2025-01-25
**Sürüm:** 0.2.0
**Durum:** Aktif Geliştirme
