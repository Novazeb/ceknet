import React, { useMemo } from 'react';
import { Radio, Activity, ArrowDown, ArrowUp, Globe, Server, MapPin } from 'lucide-react';

export default function MetricsPanel({
  ping,
  jitter,
  downloadSpeed,
  uploadSpeed,
  peakDownload,
  peakUpload,
  networkInfo,
  isGeoLoading,
  isTesting,
  currentStage
}) {
  // Suitability evaluation (compact, purposeful, zero-slop)
  const suitability = useMemo(() => {
    const isComplete = currentStage === 'complete';
    const gaming = ping > 0 && ping < 30 && jitter < 5;
    const streaming = downloadSpeed >= 25;
    const videocall = uploadSpeed >= 5 && ping > 0 && ping < 50;

    return [
      { name: 'Online Gaming', pass: gaming, desc: '<30ms ping, <5ms jitter' },
      { name: '4K Streaming', pass: streaming, desc: '>25 Mbps download' },
      { name: 'HD Video Call', pass: videocall, desc: '>5 Mbps upload, <50ms ping' }
    ];
  }, [ping, jitter, downloadSpeed, uploadSpeed, currentStage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
      
      {/* Metrics Row (8 Cols) */}
      <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Ping */}
        <div className="surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Ping Latency</span>
            <Radio className={`w-3.5 h-3.5 ${currentStage === 'ping' ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100 font-num">
              {ping > 0 ? ping : '—'}
              <span className="text-xs font-mono font-normal text-zinc-500 ml-1">ms</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-1 truncate">
              Round-trip RTT
            </div>
          </div>
        </div>

        {/* Jitter */}
        <div className="surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Jitter</span>
            <Activity className={`w-3.5 h-3.5 ${currentStage === 'ping' ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100 font-num">
              {jitter > 0 ? jitter : '—'}
              <span className="text-xs font-mono font-normal text-zinc-500 ml-1">ms</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-1 truncate">
              Latency stability
            </div>
          </div>
        </div>

        {/* Download */}
        <div className="surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Download</span>
            <ArrowDown className={`w-3.5 h-3.5 ${currentStage === 'download' ? 'text-emerald-400 animate-bounce' : 'text-zinc-600'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 font-num">
              {downloadSpeed > 0 ? downloadSpeed : '—'}
              <span className="text-xs font-mono font-normal text-zinc-500 ml-1">Mbps</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-1 truncate">
              {peakDownload > 0 ? `Peak: ${peakDownload} M` : 'Download throughput'}
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Upload</span>
            <ArrowUp className={`w-3.5 h-3.5 ${currentStage === 'upload' ? 'text-sky-400 animate-bounce' : 'text-zinc-600'}`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-sky-400 font-num">
              {uploadSpeed > 0 ? uploadSpeed : '—'}
              <span className="text-xs font-mono font-normal text-zinc-500 ml-1">Mbps</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-1 truncate">
              {peakUpload > 0 ? `Peak: ${peakUpload} M` : 'Upload throughput'}
            </div>
          </div>
        </div>

      </div>

      {/* Network Metadata & Suitability (4 Cols) */}
      <div className="lg:col-span-4 surface p-4 flex flex-col justify-between gap-3">
        
        {/* Connection Details */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/80 pb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              PUBLIC IP
            </span>
            <span className="font-semibold text-zinc-200 font-num">
              {isGeoLoading ? '...' : (networkInfo?.ip || '127.0.0.1')}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/80 pb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Server className="w-3.5 h-3.5 text-zinc-400" />
              ISP / ASN
            </span>
            <span className="font-semibold text-zinc-200 truncate max-w-[180px]" title={networkInfo?.isp}>
              {isGeoLoading ? '...' : (networkInfo?.isp || 'Unknown')}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              LOCATION
            </span>
            <span className="font-semibold text-zinc-200 truncate max-w-[180px]">
              {isGeoLoading ? '...' : `${networkInfo?.city || ''}${networkInfo?.countryCode ? ', ' + networkInfo.countryCode : ''}`}
            </span>
          </div>
        </div>

        {/* Compact Activity Suitability Badges */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          {suitability.map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 px-2 py-1.5 rounded-lg border text-center text-[10px] font-mono transition-all ${
                currentStage === 'complete'
                  ? item.pass
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
              }`}
              title={item.desc}
            >
              <div className="font-semibold truncate">{item.name}</div>
              <div className="text-[9px] mt-0.5 opacity-80">
                {currentStage === 'complete' ? (item.pass ? 'Optimal' : 'Suboptimal') : 'Ready'}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
