import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Cache-Control', 'Pragma', 'X-Requested-With']
}));

// Disable compression for speed testing endpoints
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Content-Encoding', 'identity');
  next();
});

// Parse JSON when needed
app.use(express.json());

// 1. PING ENDPOINT
app.get('/api/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    serverTime: Date.now()
  });
});

// 2. DOWNLOAD SPEED TEST ENDPOINT
// Streams uncompressed random binary chunks for a specified duration (in seconds, default 8s)
app.get('/api/download', (req, res) => {
  const durationSec = Math.min(Math.max(parseInt(req.query.duration || '8', 10), 2), 15);
  const chunkSize = 64 * 1024; // 64 KB per chunk
  const dummyChunk = crypto.randomBytes(chunkSize);
  
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="dummy.bin"');
  
  const startTime = Date.now();
  const endTime = startTime + (durationSec * 1000);
  
  let isSending = true;

  req.on('close', () => {
    isSending = false;
  });

  function sendNextChunk() {
    if (!isSending || Date.now() >= endTime) {
      if (isSending) res.end();
      return;
    }

    // Write chunk; if buffer full, wait for drain event
    const canContinue = res.write(dummyChunk);
    if (canContinue) {
      setImmediate(sendNextChunk);
    } else {
      res.once('drain', sendNextChunk);
    }
  }

  sendNextChunk();
});

// 3. UPLOAD SPEED TEST ENDPOINT
// Receives binary payload via HTTP POST and counts received bytes in real-time
app.post('/api/upload', (req, res) => {
  const startTime = Date.now();
  let totalBytes = 0;

  req.on('data', (chunk) => {
    totalBytes += chunk.length;
  });

  req.on('end', () => {
    const durationMs = Date.now() - startTime;
    res.status(200).json({
      status: 'ok',
      totalBytes,
      durationMs
    });
  });

  req.on('error', (err) => {
    console.error('Upload stream error:', err);
    res.status(500).json({ error: 'Upload stream failed' });
  });
});

// 4. NETWORK & ISP INFO INSPECTOR ENDPOINT
app.get('/api/ip', async (req, res) => {
  try {
    // Attempt fetching from ip-api.com
    const fetchRes = await fetch('http://ip-api.com/json/?fields=status,message,query,isp,org,as,city,regionName,country,countryCode,lat,lon', {
      headers: { 'User-Agent': 'ceknrt-speedtest/1.0' }
    });
    
    if (fetchRes.ok) {
      const data = await fetchRes.json();
      if (data.status === 'success') {
        return res.json({
          ip: data.query,
          isp: data.isp || data.org || 'Unknown Provider',
          as: data.as || '',
          city: data.city || 'Unknown City',
          region: data.regionName || '',
          country: data.country || 'Unknown Country',
          countryCode: data.countryCode || '',
          lat: data.lat,
          lon: data.lon
        });
      }
    }
    
    // Fallback response if external API is unreachable or rate limited
    res.json({
      ip: req.ip || '127.0.0.1',
      isp: 'Local / Direct Connection',
      city: 'Local Network',
      country: 'Global',
      countryCode: 'UN'
    });
  } catch (error) {
    console.error('GeoIP lookup error:', error);
    res.json({
      ip: req.ip || '127.0.0.1',
      isp: 'Local / Direct Connection',
      city: 'Local Network',
      country: 'Global',
      countryCode: 'UN'
    });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ ceknrt Backend API running on http://localhost:${PORT}`);
});
