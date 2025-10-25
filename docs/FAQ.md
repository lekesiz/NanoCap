# NanoCap - Sık Sorulan Sorular (FAQ)

## Genel Sorular

### Q: NanoCap nedir?
**A:** NanoCap, Chrome tarayıcısı için geliştirilmiş ultra düşük boyutlu ekran kayıt uzantısıdır. VP9/Opus codec'leri ve gelişmiş sıkıştırma teknikleri kullanarak minimum dosya boyutunda yüksek kaliteli kayıtlar üretir.

### Q: Hangi tarayıcılarda çalışır?
**A:** 
- **Chrome 116+**: Tam özellik desteği (MP4 + WebM)
- **Chrome 110-115**: WebM desteği
- **Chromium tabanlı**: Edge, Brave, Opera (sınırlı)

### Q: Ücretsiz mi?
**A:** Evet, NanoCap tamamen ücretsizdir ve MIT lisansı altında açık kaynak kodludur.

---

## Teknik Sorular

### Q: Pop-up kapanırsa kayıt durur mu?
**A:** Hayır! Kayıt Offscreen Document'ta çalışır ve pop-up kapansa da devam eder. Bu, Manifest V3'ün güvenlik mimarisinin bir parçasıdır.

### Q: Sekme sesi neden kesiliyor?
**A:** Bu Chrome'un tabCapture API'sinin normal davranışıdır. NanoCap'te "Ses aynalama" seçeneğini açarak bu sorunu çözebilirsiniz. Bu seçenek, kayıt sırasında sesin kullanıcıya da çalmasını sağlar.

### Q: Hangi format daha küçük, MP4 mü WebM mi?
**A:** VP9 (WebM), H.264 (MP4)'ten düşük bit hızlarında genellikle %20-30 daha verimlidir. NanoCap otomatik olarak platform desteğine göre en iyi formatı seçer:
- Chrome 126+: MP4 (H.264/AAC) öncelikli
- Diğer sürümler: WebM (VP9/Opus) öncelikli

### Q: FFmpeg.wasm zorunlu mu?
**A:** Hayır, isteğe bağlıdır. Temel kayıtlar zaten çok küçük boyutlarda üretilir. FFmpeg.wasm, ekstra %30-60 boyut tasarrufu için gelişmiş mod olarak sunulur.

### Q: Ne kadar CPU kullanır?
**A:** 
- **720p@15 fps**: ~10-15% CPU (orta seviye sistem)
- **1080p@30 fps**: ~20-25% CPU
- **FFmpeg aktif**: +%30-50 CPU (işlem süresi boyunca)

### Q: RAM kullanımı nasıl?
**A:** 
- **Kısa kayıtlar (<30 dk)**: ~100-200 MB
- **Uzun kayıtlar (1+ saat)**: ~300-500 MB
- **Gelecek sürümlerde**: IndexedDB ile daha az RAM

---

## Kalite ve Boyut Soruları

### Q: En küçük dosya boyutu için hangi ayarları kullanmalıyım?
**A:** 
1. **Kalite**: "Küçük" ön ayarı (720p@15fps, 900 kbps)
2. **Ses**: 96 kbps yeterli
3. **FFmpeg**: Gelişmiş modu açın (CRF 35)
4. **Sonuç**: ~280 MB/saat (normal 427 MB/saat yerine)

### Q: Kalite kaybı olur mu?
**A:** Minimal kalite kaybı ile maksimum boyut tasarrufu sağlanır:
- **Ekran kayıtları**: Gözle görülür fark yok
- **Video içerik**: Hafif detay kaybı (kabul edilebilir)
- **Metin/sunumlar**: Mükemmel kalite korunur

### Q: 1 saatlik kayıt ne kadar yer kaplar?
**A:** Senaryoya göre değişir:
- **PowerPoint sunumu**: ~210 MB (optimize)
- **Kod demo**: ~280 MB (optimize)
- **YouTube video**: ~900 MB (optimize)
- **Sadece ses**: ~45 MB

---

## İzin ve Güvenlik Soruları

### Q: Hangi izinleri istiyor?
**A:** Minimum gerekli izinler:
- `offscreen`: Kayıt işlemleri için
- `tabCapture`: Sekme yakalama
- `downloads`: Dosya indirme
- `storage`: Ayar saklama
- `activeTab`: Aktif sekmeyi algıla

### Q: Verilerim güvende mi?
**A:** Evet, tamamen güvenli:
- ✅ Tüm işlemler yerel olarak yapılır
- ✅ Hiçbir veri sunucuya gönderilmez
- ✅ Kayıtlar doğrudan bilgisayarınıza indirilir
- ✅ Açık kaynak kodlu, şeffaf

### Q: DRM korumalı içerik kaydedilebilir mi?
**A:** Hayır, bu tarayıcı güvenlik politikası gereğidir:
- Netflix, Disney+ gibi siteler siyah ekran verir
- Bu normal ve beklenen bir davranıştır
- NanoCap DRM atlatma amaçlı değildir

---

## Sorun Giderme

### Q: Kayıt başlamıyor, ne yapmalıyım?
**A:** Adım adım kontrol edin:
1. **İzinler**: Chrome izinlerini kontrol edin
2. **Sekme**: Aktif sekmede olduğunuzdan emin olun
3. **Console**: F12 → Console'da hata var mı bakın
4. **Yeniden yükle**: Uzantıyı reload edin

### Q: Ses kaydedilmiyor?
**A:** 
1. **Sekme sesi**: Sekmede ses çaldığından emin olun
2. **Ses aynalama**: Bu seçeneği açın
3. **Mikrofon**: Mikrofon izni verilmiş mi kontrol edin
4. **Ses seviyesi**: Sistem ses seviyesini kontrol edin

### Q: Dosya çok büyük çıkıyor?
**A:** 
1. **Kalite ayarı**: "Küçük" ön ayarını kullanın
2. **FPS**: 15 fps yeterli çoğu durumda
3. **Çözünürlük**: 720p çoğu ekran için yeterli
4. **FFmpeg**: Gelişmiş modu açın

### Q: Kayıt sırasında tarayıcı yavaşlıyor?
**A:** 
1. **Kalite düşürün**: "Küçük" ön ayarına geçin
2. **Diğer sekmeleri kapatın**: RAM tasarrufu için
3. **FFmpeg'i kapatın**: İşlem sonrası sıkıştırmayı devre dışı bırakın
4. **Sistem kaynaklarını kontrol edin**: CPU/RAM kullanımı

---

## Gelişmiş Sorular

### Q: Özel kalite ayarları yapabilir miyim?
**A:** Şu anda sadece ön ayarlar mevcut. Gelecek sürümlerde:
- Manuel bitrate ayarı
- Özel çözünürlük seçimi
- FPS kontrolü

### Q: Mikrofon sesi ekleyebilir miyim?
**A:** Şu anda sadece sekme sesi kaydedilir. Gelecek sürümlerde:
- Mikrofon karışımı
- Ses seviyesi kontrolü
- Gürültü azaltma

### Q: Uzun kayıtlar (2+ saat) yapabilir miyim?
**A:** Teknik olarak mümkün ama önerilmez:
- **Sorun**: RAM kullanımı artar
- **Çözüm**: v0.3.0'da File System Access ile akış yazma
- **Geçici çözüm**: Kayıtları parçalara bölün

### Q: Batch kayıt yapabilir miyim?
**A:** Şu anda tek seferde bir kayıt. Gelecek özellikler:
- Zamanlı kayıt (belirli saatlerde otomatik)
- Çoklu sekme kaydı
- Toplu işlem

---

## Performans Soruları

### Q: En iyi performans için hangi ayarları kullanmalıyım?
**A:** 
- **CPU**: "Küçük" kalite, 15 fps
- **RAM**: Uzun kayıtlarda diğer sekmeleri kapatın
- **Disk**: SSD kullanın (hızlı yazma için)
- **Ağ**: Kayıt sırasında gereksiz uygulamaları kapatın

### Q: Hangi sistem gereksinimleri var?
**A:** 
- **Minimum**: 4 GB RAM, 2 çekirdek CPU
- **Önerilen**: 8 GB RAM, 4 çekirdek CPU
- **Disk**: 1 GB boş alan (kayıtlar için)
- **Chrome**: 116+ sürümü

### Q: Mobil cihazlarda çalışır mı?
**A:** Hayır, sadece masaüstü Chrome'da çalışır:
- Mobil Chrome'da uzantı desteği yok
- Offscreen API mobilde mevcut değil
- MediaRecorder kısıtlamaları var

---

## Gelecek Özellikler

### Q: Hangi özellikler gelecek?
**A:** Yol haritası:
- **v0.3.0**: File System Access (uzun kayıtlar)
- **v0.4.0**: AV1 codec desteği
- **v0.5.0**: Otomatik dosya bölme
- **v0.6.0**: Mikrofon karışımı
- **v1.0.0**: Chrome Web Store

### Q: Özellik önerisi nasıl yapabilirim?
**A:** 
1. **GitHub Issues**: Hata bildirimi ve öneri
2. **Discussions**: Topluluk tartışmaları
3. **Pull Request**: Kod katkısı

### Q: Beta sürümlerini test edebilir miyim?
**A:** Evet! GitHub'dan en son kodu çekerek test edebilirsiniz:
```bash
git clone https://github.com/lekesiz/NanoCap.git
# chrome://extensions → Load unpacked
```

---

## Destek ve İletişim

### Q: Yardım nereden alabilirim?
**A:** 
- **GitHub Issues**: Teknik sorunlar
- **README**: Temel kullanım
- **Docs**: Detaylı dokümantasyon
- **Community**: Topluluk desteği

### Q: Hata bildirimi nasıl yaparım?
**A:** GitHub Issues'da şunları belirtin:
- Chrome sürümü
- İşletim sistemi
- Hata mesajı (console'dan)
- Adım adım tekrar etme
- Beklenen vs gerçek davranış

### Q: Katkıda bulunabilir miyim?
**A:** Evet! Katkılar çok hoş karşılanır:
- **Kod**: Pull request
- **Dokümantasyon**: İyileştirmeler
- **Test**: Hata raporlama
- **Özellik**: Öneriler

---

**Son Güncelleme:** 2025-01-25
**Sürüm:** 0.2.0
**Durum:** Aktif Geliştirme

Bu FAQ sürekli güncellenmektedir. Eksik gördüğünüz soruları GitHub Issues'da bildirebilirsiniz.
