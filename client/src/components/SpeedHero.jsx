import React, { useMemo } from 'react';
import { Play, RotateCcw, ArrowDown, ArrowUp, Activity } from 'lucide-react';

export default function SpeedHero({
  isTesting,
  currentStage,
  gaugeValue,
  downloadSpeed,
  uploadSpeed,
  downloadSamples = [],
  uploadSamples = [],
  onStartTest
}) {
  // Determine current active display value and unit
  const displayVal = useMemo(() => {
    if (currentStage === 'ping') return gaugeValue ? gaugeValue.toFixed(1) : '0';
    if (currentStage === 'download') return downloadSpeed ? downloadSpeed.toFixed(1) : (gaugeValue ? gaugeValue.toFixed(1) : '0');
    if (currentStage === 'upload') return uploadSpeed ? uploadSpeed.toFixed(1) : (gaugeValue ? gaugeValue.toFixed(1) : '0');
    if (currentStage === 'complete') return downloadSpeed ? downloadSpeed.toFixed(1) : '0';
    return '0.0';
  }, [currentStage, gaugeValue, downloadSpeed, uploadSpeed]);

  const displayUnit = currentStage === 'ping' ? 'ms' : 'Mbps';

  // Native SVG sparkline path generator (0 KB bundle, replaces 500kB Recharts)
  const sparklineData = useMemo(() => {
    const samples = currentStage === 'upload' ? uploadSamples : downloadSamples;
    if (!samples || samples.length < 2) return null;

    const width = 600;
    const height = 120;
    const padding = 10;

    const maxVal = Math.max(...samples.map((s) => s.mbps), 10);
    const minVal = 0;

    const points = samples.map((s, idx) => {
      const x = padding + (idx / (samples.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((s.mbps - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

    return { pathD, areaD, maxVal: Math.round(maxVal) };
  }, [currentStage, downloadSamples, uploadSamples]);

  return (
    <div className="surface p-6 sm:p-10 relative overflow-hidden flex flex-col items-center justify-center text-center">
      
      {/* Stage Flow Indicator Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 text-xs font-mono">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
            currentStage === 'ping'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold'
              : currentStage === 'download' || currentStage === 'upload' || currentStage === 'complete'
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
              : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-600'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentStage === 'ping' ? 'bg-amber-400 animate-ping' : 'bg-zinc-600'}`} />
          <span>PING</span>
        </div>

        <div className="text-zinc-700">/</div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
            currentStage === 'download'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold'
              : currentStage === 'upload' || currentStage === 'complete'
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
              : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-600'
          }`}
        >
          <ArrowDown className="w-3 h-3" />
          <span>DOWNLOAD</span>
        </div>

        <div className="text-zinc-700">/</div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
            currentStage === 'upload'
              ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 font-semibold'
              : currentStage === 'complete'
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
              : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-600'
          }`}
        >
          <ArrowUp className="w-3 h-3" />
          <span>UPLOAD</span>
        </div>
      </div>

      {/* Hero Central Speed Readout */}
      <div className="relative py-2 sm:py-4 flex flex-col items-center justify-center">
        <div className="flex items-baseline justify-center tracking-tighter">
          <span className="text-7xl sm:text-8xl md:text-9xl font-mono font-bold text-zinc-100 font-num select-none">
            {displayVal}
          </span>
          <span className="text-xl sm:text-2xl font-mono font-medium text-zinc-500 ml-2 sm:ml-4 select-none">
            {displayUnit}
          </span>
        </div>

        <div className="text-xs font-mono text-zinc-500 mt-2">
          {currentStage === 'idle' && 'Connection ready for testing'}
          {currentStage === 'ping' && 'Measuring round-trip latency (RTT)...'}
          {currentStage === 'download' && 'Measuring download throughput...'}
          {currentStage === 'upload' && 'Measuring upload throughput...'}
          {currentStage === 'complete' && 'Diagnostics completed'}
        </div>
      </div>

      {/* Native SVG Sparkline Canvas */}
      <div className="w-full max-w-2xl h-24 mt-4 relative">
        {sparklineData ? (
          <svg viewBox="0 0 600 120" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={currentStage === 'upload' ? '#0ea5e9' : '#10b981'}
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={currentStage === 'upload' ? '#0ea5e9' : '#10b981'}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <path d={sparklineData.areaD} fill="url(#sparklineGrad)" />
            <path
              d={sparklineData.pathD}
              fill="none"
              stroke={currentStage === 'upload' ? '#38bdf8' : '#34d399'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="w-full h-full flex items-center justify-center border border-dashed border-zinc-800/80 rounded-lg">
            <span className="text-xs font-mono text-zinc-600 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 opacity-50" />
              Real-time throughput activity will appear during testing
            </span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="mt-8">
        <button
          onClick={onStartTest}
          disabled={isTesting}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            isTesting
              ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              : 'bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-lg shadow-white/5 active:scale-[0.98]'
          }`}
        >
          {isTesting ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-zinc-500" />
              <span className="font-mono">TEST IN PROGRESS...</span>
            </>
          ) : currentStage === 'complete' ? (
            <>
              <RotateCcw className="w-4 h-4 text-zinc-950" />
              <span className="font-mono">RETEST</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-zinc-950" />
              <span className="font-mono">START TEST</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
