import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SpeedHero from './components/SpeedHero';
import MetricsPanel from './components/MetricsPanel';
import TestHistory from './components/TestHistory';
import {
  runPingAndJitterTest,
  runDownloadTest,
  runUploadTest,
  getNetworkAndISPInfo
} from './services/speedTestEngine';

const LOCAL_STORAGE_KEY = 'ceknet_speedtest_history_v2';

export default function App() {
  const [isTesting, setIsTesting] = useState(false);
  const [currentStage, setCurrentStage] = useState('idle'); // idle | ping | download | upload | complete
  const [gaugeValue, setGaugeValue] = useState(0);

  // Test metrics state
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [peakDownload, setPeakDownload] = useState(0);
  const [peakUpload, setPeakUpload] = useState(0);

  // Real-time samples for native SVG sparkline
  const [downloadSamples, setDownloadSamples] = useState([]);
  const [uploadSamples, setUploadSamples] = useState([]);

  // Network Inspector & History
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // Load history & fetch network inspector on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn('Failed to parse history:', e);
    }

    // Initial GeoIP scan
    getNetworkAndISPInfo().then((info) => {
      setNetworkInfo(info);
      setIsGeoLoading(false);
    });
  }, []);

  // Save history helper
  const saveHistoryEntry = useCallback((newEntry) => {
    setHistory((prev) => {
      const updated = [newEntry, ...prev].slice(0, 50);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history:', e);
      }
      return updated;
    });
  }, []);

  // Clear history handler
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
  };

  // Main Speed Test Diagnostic Procedure
  const startFullDiagnosticTest = async () => {
    if (isTesting) return;

    setIsTesting(true);
    setGaugeValue(0);
    setPing(0);
    setJitter(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPeakDownload(0);
    setPeakUpload(0);
    setDownloadSamples([]);
    setUploadSamples([]);

    // Refresh GeoIP info
    setIsGeoLoading(true);
    const freshNetInfo = await getNetworkAndISPInfo();
    setNetworkInfo(freshNetInfo);
    setIsGeoLoading(false);

    try {
      // 1. PING & JITTER TEST
      setCurrentStage('ping');
      const pingResult = await runPingAndJitterTest((prog) => {
        setPing(prog.currentPing);
        setJitter(prog.currentJitter);
        setGaugeValue(prog.currentPing);
      }, 10);

      setPing(pingResult.ping);
      setJitter(pingResult.jitter);

      await new Promise((r) => setTimeout(r, 200));

      // 2. DOWNLOAD SPEED TEST
      setCurrentStage('download');
      setGaugeValue(0);

      const downloadResult = await runDownloadTest((prog) => {
        setGaugeValue(prog.instantMbps);
        setDownloadSpeed(prog.instantMbps);
        setDownloadSamples((prev) => [
          ...prev,
          { timeSec: prog.elapsedSec, mbps: prog.instantMbps }
        ]);
      }, 7);

      setDownloadSpeed(downloadResult.downloadSpeed);
      setPeakDownload(downloadResult.peakSpeed);
      setGaugeValue(downloadResult.downloadSpeed);

      await new Promise((r) => setTimeout(r, 200));

      // 3. UPLOAD SPEED TEST
      setCurrentStage('upload');
      setGaugeValue(0);

      const uploadResult = await runUploadTest((prog) => {
        setGaugeValue(prog.instantMbps);
        setUploadSpeed(prog.instantMbps);
        setUploadSamples((prev) => [
          ...prev,
          { timeSec: prog.elapsedSec, mbps: prog.instantMbps }
        ]);
      }, 7);

      setUploadSpeed(uploadResult.uploadSpeed);
      setPeakUpload(uploadResult.peakSpeed);
      setGaugeValue(uploadResult.uploadSpeed);

      await new Promise((r) => setTimeout(r, 200));

      // 4. COMPLETE & SAVE HISTORY
      setCurrentStage('complete');

      const historyEntry = {
        timestamp: new Date().toLocaleString('id-ID', {
          dateStyle: 'short',
          timeStyle: 'short'
        }),
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        downloadSpeed: downloadResult.downloadSpeed,
        uploadSpeed: uploadResult.uploadSpeed,
        ip: freshNetInfo?.ip || 'N/A',
        isp: freshNetInfo?.isp || 'N/A',
        status: 'Selesai'
      };

      saveHistoryEntry(historyEntry);

    } catch (error) {
      console.error('Speed test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white pb-16">
      
      {/* Header */}
      <Header
        isTesting={isTesting}
        currentStage={currentStage}
        onStartTest={startFullDiagnosticTest}
      />

      {/* Main Focus Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 w-full flex-grow flex flex-col gap-4 mt-6">
        
        {/* Speed Hero: Big Typographic Readout & Native SVG Sparkline */}
        <SpeedHero
          isTesting={isTesting}
          currentStage={currentStage}
          gaugeValue={gaugeValue}
          downloadSpeed={downloadSpeed}
          uploadSpeed={uploadSpeed}
          downloadSamples={downloadSamples}
          uploadSamples={uploadSamples}
          onStartTest={startFullDiagnosticTest}
        />

        {/* Metrics Panel: High-Density Latency, Throughput & Geo Details */}
        <MetricsPanel
          ping={ping}
          jitter={jitter}
          downloadSpeed={downloadSpeed}
          uploadSpeed={uploadSpeed}
          peakDownload={peakDownload}
          peakUpload={peakUpload}
          networkInfo={networkInfo}
          isGeoLoading={isGeoLoading}
          isTesting={isTesting}
          currentStage={currentStage}
        />

        {/* Test History */}
        <TestHistory
          history={history}
          onClearHistory={handleClearHistory}
        />

      </main>

      {/* Minimalist Footer */}
      <footer className="mt-12 border-t border-zinc-900 pt-6 text-center text-xs font-mono text-zinc-600">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ceknet // zero-slop internet diagnostics</span>
          <span>edge cdn & local fallback</span>
        </div>
      </footer>

    </div>
  );
}
