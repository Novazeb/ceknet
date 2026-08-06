import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SpeedometerGauge from './components/SpeedometerGauge';
import MetricsCards from './components/MetricsCards';
import LiveChart from './components/LiveChart';
import SuitabilityRating from './components/SuitabilityRating';
import NetworkInfoInspector from './components/NetworkInfoInspector';
import TestHistory from './components/TestHistory';
import {
  runPingAndJitterTest,
  runDownloadTest,
  runUploadTest,
  getNetworkAndISPInfo
} from './services/speedTestEngine';
import { Globe, ShieldCheck } from 'lucide-react';

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

  // Chart real-time samples
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
      // -------------------------------------------------------------
      // STAGE 1: PING & JITTER TEST
      // -------------------------------------------------------------
      setCurrentStage('ping');
      const pingResult = await runPingAndJitterTest((prog) => {
        setPing(prog.currentPing);
        setJitter(prog.currentJitter);
        setGaugeValue(prog.currentPing);
      }, 10);

      setPing(pingResult.ping);
      setJitter(pingResult.jitter);

      await new Promise((r) => setTimeout(r, 300));

      // -------------------------------------------------------------
      // STAGE 2: DOWNLOAD SPEED TEST
      // -------------------------------------------------------------
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

      await new Promise((r) => setTimeout(r, 300));

      // -------------------------------------------------------------
      // STAGE 3: UPLOAD SPEED TEST
      // -------------------------------------------------------------
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

      // -------------------------------------------------------------
      // STAGE 4: COMPLETE & SAVE HISTORY
      // -------------------------------------------------------------
      setCurrentStage('complete');

      const historyEntry = {
        timestamp: new Date().toLocaleString('id-ID', {
          dateStyle: 'medium',
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16">
      
      {/* Top Header */}
      <Header
        isTesting={isTesting}
        currentStage={currentStage}
        onStartTest={startFullDiagnosticTest}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 w-full flex-grow flex flex-col gap-6">
        
        {/* Top Hero Section: Speedometer Gauge + Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Speedometer Dial */}
          <div className="lg:col-span-5 flex">
            <SpeedometerGauge
              value={gaugeValue}
              stage={currentStage}
            />
          </div>

          {/* Status Cards Grid */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            
            {/* Informational Header Box */}
            <div className="card-clean p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Pengujian Kecepatan Internet WAN
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pengukuran langsung throughput fisik koneksi internet ke server CDN terdekat
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Status Cards */}
            <MetricsCards
              ping={ping}
              jitter={jitter}
              downloadSpeed={downloadSpeed}
              uploadSpeed={uploadSpeed}
              peakDownload={peakDownload}
              peakUpload={peakUpload}
              isTesting={isTesting}
              currentStage={currentStage}
            />
          </div>

        </div>

        {/* Real-time Bandwidth Line Chart */}
        <LiveChart
          downloadSamples={downloadSamples}
          uploadSamples={uploadSamples}
        />

        {/* Network Suitability Rating */}
        <SuitabilityRating
          ping={ping}
          jitter={jitter}
          downloadSpeed={downloadSpeed}
          uploadSpeed={uploadSpeed}
          isComplete={currentStage === 'complete'}
        />

        {/* Network & ISP Info Inspector */}
        <NetworkInfoInspector
          info={networkInfo}
          isLoading={isGeoLoading}
        />

        {/* Test History & CSV Export */}
        <TestHistory
          history={history}
          onClearHistory={handleClearHistory}
        />

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">ceknet</span> — Diagnostic Speed Test Dashboard
          </div>
          <div>
            Dikembangkan dengan React & Express
          </div>
        </div>
      </footer>

    </div>
  );
}
