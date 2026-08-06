import React, { useMemo } from 'react';

export default function SpeedometerGauge({ value = 0, stage = 'idle' }) {
  // Auto-scale max speed based on speed reading (up to 100 Mbps or 500 Mbps for normal home connection)
  const currentMax = useMemo(() => {
    if (value > 250) return 500;
    if (value > 100) return 250;
    if (value > 50) return 100;
    if (value > 20) return 50;
    return 20;
  }, [value]);

  // Calculate needle angle in degrees (-120deg to +120deg)
  const angle = useMemo(() => {
    const clampedVal = Math.min(Math.max(value, 0), currentMax);
    const percent = clampedVal / currentMax;
    return -120 + percent * 240;
  }, [value, currentMax]);

  // Generate tick marks
  const ticks = useMemo(() => {
    const stepCount = 5;
    const items = [];
    for (let i = 0; i <= stepCount; i++) {
      const tickVal = Math.round((currentMax / stepCount) * i);
      const tickAngle = -120 + (i / stepCount) * 240;
      const rad = (tickAngle - 90) * (Math.PI / 180);
      const radius = 102;
      const labelRadius = 82;
      
      const x1 = 140 + radius * Math.cos(rad);
      const y1 = 140 + radius * Math.sin(rad);
      const x2 = 140 + (radius - 8) * Math.cos(rad);
      const y2 = 140 + (radius - 8) * Math.sin(rad);

      const lx = 140 + labelRadius * Math.cos(rad);
      const ly = 140 + labelRadius * Math.sin(rad);

      items.push({ val: tickVal, x1, y1, x2, y2, lx, ly });
    }
    return items;
  }, [currentMax]);

  // Stage display text & badge colors
  const stageInfo = useMemo(() => {
    switch (stage) {
      case 'ping':
        return { label: 'Mengukur Ping & Jitter', color: 'bg-amber-100 text-amber-800 border-amber-200', unit: 'ms' };
      case 'download':
        return { label: 'Menguji Download', color: 'bg-blue-100 text-blue-800 border-blue-200', unit: 'Mbps' };
      case 'upload':
        return { label: 'Menguji Upload', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', unit: 'Mbps' };
      case 'complete':
        return { label: 'Pengujian Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', unit: 'Mbps' };
      default:
        return { label: 'Siap Melakukan Tes', color: 'bg-slate-100 text-slate-700 border-slate-200', unit: 'Mbps' };
    }
  }, [stage]);

  return (
    <div className="card-clean p-6 sm:p-8 flex flex-col items-center justify-center relative w-full">
      
      {/* Stage Badge */}
      <div className="mb-2">
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${stageInfo.color}`}>
          {stageInfo.label}
        </span>
      </div>

      {/* Speedometer SVG Gauge */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
          {/* Background Track Arc */}
          <path
            d="M 45 195 A 110 110 0 1 1 235 195"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            d="M 45 195 A 110 110 0 1 1 235 195"
            fill="none"
            stroke="#2563eb"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="520"
            strokeDashoffset={520 - (520 * (Math.min(value, currentMax) / currentMax))}
            className="transition-all duration-300 ease-out"
          />

          {/* Ticks and Scale Labels */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <text
                x={t.lx}
                y={t.ly}
                fill="#64748b"
                fontSize="11"
                fontWeight="500"
                className="font-num"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {t.val}
              </text>
            </g>
          ))}

          {/* Gauge Needle Pointer */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '140px 140px',
              transition: 'transform 0.25s ease-out'
            }}
          >
            <line
              x1="140"
              y1="140"
              x2="140"
              y2="42"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="140" cy="140" r="8" fill="#0f172a" />
            <circle cx="140" cy="140" r="3" fill="#ffffff" />
          </g>
        </svg>

        {/* Center Live Digital Readout Overlay */}
        <div className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="text-4xl sm:text-5xl font-bold font-num text-slate-900 tracking-tight">
            {value > 0 ? value.toFixed(1) : '0.0'}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
            {stageInfo.unit}
          </div>
        </div>
      </div>

      {/* Auto-scale indication */}
      <div className="mt-1 text-xs text-slate-400 font-num">
        Skala Maksimum: <span className="text-slate-600 font-medium">{currentMax} Mbps</span>
      </div>

    </div>
  );
}
