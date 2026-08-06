import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function LiveChart({ downloadSamples = [], uploadSamples = [] }) {
  // Merge samples into unified timeline format
  const mergedData = React.useMemo(() => {
    const timeMap = new Map();

    downloadSamples.forEach((s) => {
      timeMap.set(s.timeSec, { timeSec: `${s.timeSec}s`, download: s.mbps, upload: null });
    });

    uploadSamples.forEach((s) => {
      const existing = timeMap.get(s.timeSec);
      if (existing) {
        existing.upload = s.mbps;
      } else {
        timeMap.set(s.timeSec, { timeSec: `${s.timeSec}s`, download: null, upload: s.mbps });
      }
    });

    const result = Array.from(timeMap.values()).sort((a, b) => parseFloat(a.timeSec) - parseFloat(b.timeSec));
    
    if (result.length === 0) {
      return [
        { timeSec: '0s', download: 0, upload: 0 },
        { timeSec: '2s', download: 0, upload: 0 },
        { timeSec: '4s', download: 0, upload: 0 },
        { timeSec: '6s', download: 0, upload: 0 },
        { timeSec: '8s', download: 0, upload: 0 }
      ];
    }
    return result;
  }, [downloadSamples, uploadSamples]);

  return (
    <div className="card-clean p-6 w-full">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Grafik Kecepatan Real-Time
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perkembangan kecepatan Download & Upload selama proses pengujian
          </p>
        </div>

        {/* Chart Legend Pills */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Download (Mbps)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Upload (Mbps)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="timeSec"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              className="font-num"
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              unit=" M"
              className="font-num"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                fontSize: '12px',
                fontFamily: 'Inter'
              }}
              formatter={(val) => [val != null ? `${val} Mbps` : '—', '']}
            />
            <Line
              type="monotone"
              dataKey="download"
              name="Download"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#1d4ed8' }}
              connectNulls
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="upload"
              name="Upload"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#4338ca' }}
              connectNulls
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
