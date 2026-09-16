/**
 * ceknet Network Speed & Diagnostic Test Engine
 * Direct Internet WAN Speed Testing via Cloudflare Edge API with Local Fallback
 */

// Helper to calculate mean
const mean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// Helper to calculate standard deviation (Jitter)
const standardDeviation = (arr) => {
  if (arr.length <= 1) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map((val) => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

// Cloudflare public edge endpoints for true internet speed testing
const CF_PING_URL = 'https://speed.cloudflare.com/__down?bytes=0';
const CF_DOWNLOAD_URL = 'https://speed.cloudflare.com/__down?bytes=25000000'; // 25 MB stream
const CF_UPLOAD_URL = 'https://speed.cloudflare.com/__up';

export async function runPingAndJitterTest(onProgress, samplesCount = 10) {
  const latencies = [];

  // Warm-up request
  try {
    await fetch(`${CF_PING_URL}&warm=${Date.now()}`, { cache: 'no-store' });
  } catch (e) {
    // ignore
  }

  for (let i = 0; i < samplesCount; i++) {
    const start = performance.now();
    try {
      // Primary internet ping endpoint
      let res;
      try {
        res = await fetch(`${CF_PING_URL}&t=${Date.now()}_${i}`, { cache: 'no-store' });
      } catch (err) {
        // Fallback to local server ping if offline
        res = await fetch(`/api/ping?t=${Date.now()}_${i}`, { cache: 'no-store' });
      }

      if (res && res.ok) {
        const end = performance.now();
        const rtt = Math.max(end - start, 1.0);
        latencies.push(rtt);
        const currentPing = mean(latencies);
        const currentJitter = standardDeviation(latencies);

        if (onProgress) {
          onProgress({
            step: 'ping',
            progress: ((i + 1) / samplesCount) * 100,
            currentPing: Number(currentPing.toFixed(1)),
            currentJitter: Number(currentJitter.toFixed(1)),
            latencies
          });
        }
      }
    } catch (err) {
      console.warn('Ping sample failed:', err);
    }
    await new Promise((r) => setTimeout(r, 70));
  }

  const finalPing = mean(latencies);
  const finalJitter = standardDeviation(latencies);

  return {
    ping: Number(finalPing.toFixed(1)),
    jitter: Number(finalJitter.toFixed(1)),
    samples: latencies
  };
}

export async function runDownloadTest(onProgress, durationSec = 7) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), (durationSec + 4) * 1000);

  const samples = [];
  let totalBytes = 0;
  const startTime = performance.now();
  let lastSampleTime = startTime;
  let lastSampleBytes = 0;
  let peakSpeed = 0;
  let smoothedSpeed = 0;

  try {
    let response;
    try {
      response = await fetch(`${CF_DOWNLOAD_URL}&t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store'
      });
    } catch (err) {
      // Local server fallback if external internet fetch fails
      response = await fetch(`/api/download?duration=${durationSec}&t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store'
      });
    }

    if (!response.ok || !response.body) {
      throw new Error('Download endpoint unavailable');
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      const now = performance.now();
      const elapsedTotalSec = (now - startTime) / 1000;

      if (done || elapsedTotalSec >= durationSec) {
        try { reader.cancel(); } catch (e) {}
        break;
      }

      if (value) {
        totalBytes += value.length;
      }

      const sampleDeltaSec = (now - lastSampleTime) / 1000;
      // Sample every ~120ms
      if (sampleDeltaSec >= 0.12) {
        const deltaBytes = totalBytes - lastSampleBytes;
        const instantMbps = (deltaBytes * 8) / (sampleDeltaSec * 1_000_000);
        const overallMbps = (totalBytes * 8) / (elapsedTotalSec * 1_000_000);

        // Exponential smoothing for steady realistic speed display
        if (smoothedSpeed === 0) {
          smoothedSpeed = instantMbps;
        } else {
          smoothedSpeed = smoothedSpeed * 0.65 + instantMbps * 0.35;
        }

        if (smoothedSpeed > peakSpeed) peakSpeed = smoothedSpeed;
        const roundedSpeed = Number(smoothedSpeed.toFixed(2));

        samples.push({
          timeSec: Number(elapsedTotalSec.toFixed(1)),
          mbps: roundedSpeed
        });

        if (onProgress) {
          onProgress({
            step: 'download',
            progress: Math.min((elapsedTotalSec / durationSec) * 100, 100),
            instantMbps: roundedSpeed,
            totalBytes,
            elapsedSec: Number(elapsedTotalSec.toFixed(1))
          });
        }

        lastSampleTime = now;
        lastSampleBytes = totalBytes;
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Download test error:', err);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  const totalTimeSec = (performance.now() - startTime) / 1000;
  const avgSpeedMbps = totalTimeSec > 0 ? (totalBytes * 8) / (totalTimeSec * 1_000_000) : 0;

  return {
    downloadSpeed: Number(avgSpeedMbps.toFixed(2)),
    peakSpeed: Number(peakSpeed.toFixed(2)),
    totalBytesReceived: totalBytes,
    samples
  };
}

export async function runUploadTest(onProgress, durationSec = 7) {
  const startTime = performance.now();
  const endTime = startTime + (durationSec * 1000);

  let totalBytesSent = 0;
  const samples = [];
  let peakSpeed = 0;
  let lastSampleTime = startTime;
  let lastSampleBytes = 0;
  let smoothedSpeed = 0;

  // 1MB chunk size payload
  const payloadSize = 1 * 1024 * 1024;
  const dummyPayload = new Uint8Array(payloadSize);
  for (let i = 0; i < payloadSize; i += 8192) {
    dummyPayload[i] = Math.floor(Math.random() * 256);
  }

  while (performance.now() < endTime) {
    try {
      let res;
      try {
        res = await fetch(`${CF_UPLOAD_URL}?t=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: dummyPayload,
          cache: 'no-store'
        });
      } catch (e) {
        // Fallback to local server upload if external fails
        res = await fetch(`/api/upload?t=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: dummyPayload,
          cache: 'no-store'
        });
      }

      if (res && res.ok) {
        totalBytesSent += payloadSize;
        const now = performance.now();
        const elapsedTotalSec = (now - startTime) / 1000;
        const sampleDeltaSec = (now - lastSampleTime) / 1000;

        if (sampleDeltaSec >= 0.12) {
          const deltaBytes = totalBytesSent - lastSampleBytes;
          const instantMbps = (deltaBytes * 8) / (sampleDeltaSec * 1_000_000);
          
          if (smoothedSpeed === 0) {
            smoothedSpeed = instantMbps;
          } else {
            smoothedSpeed = smoothedSpeed * 0.65 + instantMbps * 0.35;
          }

          if (smoothedSpeed > peakSpeed) peakSpeed = smoothedSpeed;
          const roundedSpeed = Number(smoothedSpeed.toFixed(2));

          samples.push({
            timeSec: Number(elapsedTotalSec.toFixed(1)),
            mbps: roundedSpeed
          });

          if (onProgress) {
            onProgress({
              step: 'upload',
              progress: Math.min((elapsedTotalSec / durationSec) * 100, 100),
              instantMbps: roundedSpeed,
              totalBytesSent,
              elapsedSec: Number(elapsedTotalSec.toFixed(1))
            });
          }

          lastSampleTime = now;
          lastSampleBytes = totalBytesSent;
        }
      }
    } catch (err) {
      console.warn('Upload chunk error:', err);
      break;
    }
  }

  const totalTimeSec = (performance.now() - startTime) / 1000;
  const avgSpeedMbps = totalTimeSec > 0 ? (totalBytesSent * 8) / (totalTimeSec * 1_000_000) : 0;

  return {
    uploadSpeed: Number(avgSpeedMbps.toFixed(2)),
    peakSpeed: Number(peakSpeed.toFixed(2)),
    totalBytesSent,
    samples
  };
}

export async function getNetworkAndISPInfo() {
  let geoData = {
    ip: 'Scanning...',
    isp: 'Loading ISP...',
    city: 'Loading...',
    country: 'Loading...'
  };

  try {
    const res = await fetch('/api/ip');
    if (res.ok) {
      const data = await res.json();
      geoData = { ...geoData, ...data };
    }
  } catch (e) {
    console.warn('GeoIP fetch failed:', e);
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};

  return {
    ip: geoData.ip,
    isp: geoData.isp,
    as: geoData.as || '',
    city: geoData.city,
    region: geoData.region || '',
    country: geoData.country,
    countryCode: geoData.countryCode || '',
    browserConnection: {
      type: connection.type || 'Unknown',
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink ? `${connection.downlink} Mbps` : 'N/A',
      rtt: connection.rtt ? `${connection.rtt} ms` : 'N/A'
    }
  };
}
