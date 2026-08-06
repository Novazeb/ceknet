import React from 'react';
import { ArrowDown, ArrowUp, Radio, Activity } from 'lucide-react';

export default function MetricsCards({ ping, jitter, downloadSpeed, uploadSpeed, peakDownload, peakUpload, isTesting, currentStage }) {
  const cards = [
    {
      id: 'ping',
      title: 'Ping Latency',
      value: ping > 0 ? `${ping}` : '—',
      unit: 'ms',
      subtext: 'Waktu respon',
      icon: Radio,
      active: currentStage === 'ping'
    },
    {
      id: 'jitter',
      title: 'Jitter Fluktuasi',
      value: jitter > 0 ? `${jitter}` : '—',
      unit: 'ms',
      subtext: 'Kestabilan koneksi',
      icon: Activity,
      active: currentStage === 'ping'
    },
    {
      id: 'download',
      title: 'Kecepatan Download',
      value: downloadSpeed > 0 ? `${downloadSpeed}` : '—',
      unit: 'Mbps',
      subtext: peakDownload > 0 ? `Peak: ${peakDownload} Mbps` : 'Kecepatan unduh',
      icon: ArrowDown,
      active: currentStage === 'download'
    },
    {
      id: 'upload',
      title: 'Kecepatan Upload',
      value: uploadSpeed > 0 ? `${uploadSpeed}` : '—',
      unit: 'Mbps',
      subtext: peakUpload > 0 ? `Peak: ${peakUpload} Mbps` : 'Kecepatan unggah',
      icon: ArrowUp,
      active: currentStage === 'upload'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`card-clean card-clean-hover p-5 relative ${
              card.active ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {card.title}
              </span>
              <div className="p-2 rounded-md bg-slate-100 text-slate-600">
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-bold font-num text-slate-900 tracking-tight">
                {card.value}
              </span>
              {card.value !== '—' && (
                <span className="text-sm font-semibold text-slate-500 font-num">
                  {card.unit}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
