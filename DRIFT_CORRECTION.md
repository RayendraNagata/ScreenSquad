# Video Drift Correction System

## Overview

Sistem koreksi drift video ScreenSquad menggunakan pendekatan **linear adjustment** untuk menyinkronkan playback video antar client dengan akurasi tinggi. Sistem ini mengukur perbedaan latency antara client-server dan melakukan penyesuaian posisi video secara bertahap untuk meminimalkan gangguan pada pengalaman menonton.

## Fitur Utama

### 🎯 **Pengukuran Latency Real-time**
- Ping/pong mechanism untuk mengukur round-trip time
- Rata-rata dari 10 pengukuran terakhir untuk akurasi
- Update otomatis setiap 3-5 detik

### 📊 **Smart Drift Detection**
- Kompensasi latency network pada perhitungan drift
- Toleransi drift yang dapat dikonfigurasi (50ms - 5s)
- Riwayat drift untuk analisis stabilitas

### ⚡ **Linear Adjustment Algorithm**
- Koreksi bertahap dengan rate yang dapat disesuaikan (0.5% - 10% per frame)
- Menghindari "jump" yang mengganggu pengalaman menonton
- Koreksi otomatis berhenti ketika drift dalam toleransi

### 🎛️ **Kontrol Host**
- Pengaturan real-time untuk host squad
- Preset konfigurasi (Conservative, Balanced, Aggressive)
- Monitor performa dan statistik drift

## Komponen Sistem

### 1. **videoStore.js - Core Logic**

```javascript
// Fungsi utama koreksi drift
smartSync(serverTime, serverPlaying, latency)
calculateDrift(serverTime, clientTime, latency)
applyLinearAdjustment()
```

**Algoritma Linear Adjustment:**
```javascript
const drift = targetSyncTime - currentTime;
const adjustmentDirection = drift > 0 ? 1 : -1;
const adjustmentAmount = Math.min(
  Math.abs(drift), 
  adjustmentRate
) * adjustmentDirection;
```

### 2. **useDriftCorrection.js - React Hook**

- Setup periodic latency measurement (default: 5s interval)
- Animation frame loop untuk smooth adjustment
- Event listeners untuk sync responses

### 3. **DriftMonitor.jsx - Visual Feedback**

- Real-time display drift dan latency
- Statistik performa (average drift, stability)
- Compact mode untuk integrasi di video player

### 4. **DriftSettings.jsx - Host Controls**

- Penyesuaian parameter real-time
- Preset konfigurasi untuk berbagai skenario
- Reset statistik dan kalibrasi ulang

## Konfigurasi Parameter

### **adjustmentRate** (Default: 0.02)
- Range: 0.005 - 0.1 (0.5% - 10%)
- Persentase adjustment per animation frame
- **Conservative:** 0.01 (1%) - Smooth tapi lambat
- **Balanced:** 0.02 (2%) - Optimal untuk kebanyakan kasus
- **Aggressive:** 0.05 (5%) - Cepat tapi mungkin terlihat

### **maxDriftTolerance** (Default: 1.0s)
- Range: 0.5s - 5s
- Threshold untuk immediate sync
- Drift lebih besar akan memicu hard sync

### **minDriftTolerance** (Default: 0.1s)
- Range: 50ms - 500ms
- Threshold minimum untuk memulai koreksi
- Drift lebih kecil diabaikan untuk menghindari over-correction

### **syncInterval** (Default: 5000ms)
- Range: 1s - 10s
- Frekuensi pengukuran latency dan sync check
- Network yang stabil bisa menggunakan interval lebih panjang

## Implementasi di Backend

### **Socket Events**

```javascript
// Ping/Pong untuk latency measurement
socket.on('ping', (data) => {
  socket.emit('pong', {
    ...data,
    serverTimestamp: Date.now()
  });
});

// Sync request handling
socket.on('request-sync', (data) => {
  const serverTime = calculateCurrentServerTime();
  socket.emit('sync-response', {
    serverTime,
    isPlaying: currentState.isPlaying,
    timestamp: data.timestamp,
    serverTimestamp: Date.now()
  });
});
```

## Penggunaan

### **Basic Integration**

```jsx
import useDriftCorrection from '../hooks/useDriftCorrection';
import DriftMonitor from '../components/DriftMonitor';

const VideoPlayer = () => {
  const driftCorrection = useDriftCorrection(true, 3000);
  
  return (
    <div className="video-container">
      <video ref={videoRef} />
      
      {/* Compact drift monitor */}
      <DriftMonitor 
        enabled={true} 
        compact={true}
        className="absolute top-4 right-4"
      />
    </div>
  );
};
```

### **Host Controls**

```jsx
import DriftSettings from '../components/DriftSettings';

const SquadHeader = ({ isHost }) => {
  return (
    <div className="squad-header">
      <DriftSettings isHost={isHost} />
    </div>
  );
};
```

## Metrik Performa

### **Drift Statistics**
- **Average Drift:** Rata-rata drift dari 20 sample terakhir
- **Max Drift:** Drift maksimum yang tercatat
- **Stability:** Inversi dari variance drift (0-1, higher is better)
- **Samples:** Jumlah data point untuk statistik

### **Target Performance**
- **Latency:** < 100ms untuk jaringan lokal, < 300ms untuk internet
- **Drift:** < 200ms average untuk pengalaman optimal
- **Stability:** > 0.8 untuk koneksi yang stabil

## Troubleshooting

### **High Drift (>500ms)**
1. Check network stability
2. Reduce sync interval (1-2s)
3. Use aggressive preset
4. Verify server time accuracy

### **Frequent Corrections**
1. Increase minDriftTolerance (200-300ms)
2. Reduce adjustmentRate untuk smoother correction
3. Check for network jitter

### **Correction Too Slow**
1. Increase adjustmentRate (3-5%)
2. Reduce maxDriftTolerance untuk faster hard sync
3. Decrease sync interval

### **Jumpy Playback**
1. Reduce adjustmentRate (1-1.5%)
2. Increase minDriftTolerance
3. Use conservative preset

## Best Practices

1. **Start with Balanced preset** untuk kebanyakan kasus
2. **Monitor stability metric** - jika < 0.5, ada masalah network
3. **Adjust parameters gradually** - perubahan kecil sering lebih efektif
4. **Reset statistics** setelah perubahan network atau setting
5. **Use compact monitor** di production, detailed untuk debugging

## Future Enhancements

1. **Adaptive Parameters** - AI-based adjustment berdasarkan network conditions
2. **Predictive Sync** - Prediksi drift berdasarkan pola historis
3. **Quality-based Correction** - Adjustment berbeda untuk quality level berbeda
4. **Multi-host Sync** - Sinkronisasi dengan multiple reference points
