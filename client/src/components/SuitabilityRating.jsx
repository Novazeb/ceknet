import React, { useMemo } from 'react';
import { Gamepad2, Tv, Video, CheckCircle, XCircle } from 'lucide-react';

export default function SuitabilityRating({ ping = 0, jitter = 0, downloadSpeed = 0, uploadSpeed = 0, isComplete = false }) {
  const evaluations = useMemo(() => {
    const gamingPassed = ping > 0 && ping < 30 && jitter < 5;
    const streamingPassed = downloadSpeed >= 25;
    const videoPassed = uploadSpeed >= 5 && ping > 0 && ping < 50;

    let overallGrade = 'Belum Dites';
    let gradeBadge = 'bg-slate-100 text-slate-600 border-slate-200';

    if (isComplete) {
      if (gamingPassed && streamingPassed && videoPassed) {
        overallGrade = 'Sangat Baik';
        gradeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (streamingPassed || videoPassed) {
        overallGrade = 'Cukup Baik';
        gradeBadge = 'bg-blue-50 text-blue-700 border-blue-200';
      } else {
        overallGrade = 'Kurang Stabil';
        gradeBadge = 'bg-amber-50 text-amber-700 border-amber-200';
      }
    }

    return {
      items: [
        {
          title: 'Gaming Online',
          req: 'Syarat: Ping < 30ms & Jitter < 5ms',
          icon: Gamepad2,
          passed: gamingPassed,
          detail: `Ping ${ping} ms, Jitter ${jitter} ms`
        },
        {
          title: 'Streaming 4K / Ultra HD',
          req: 'Syarat: Download > 25 Mbps',
          icon: Tv,
          passed: streamingPassed,
          detail: `Download ${downloadSpeed} Mbps`
        },
        {
          title: 'Video Call & Zoom',
          req: 'Syarat: Upload > 5 Mbps & Ping < 50ms',
          icon: Video,
          passed: videoPassed,
          detail: `Upload ${uploadSpeed} Mbps, Ping ${ping} ms`
        }
      ],
      grade: overallGrade,
      badgeStyle: gradeBadge
    };
  }, [ping, jitter, downloadSpeed, uploadSpeed, isComplete]);

  return (
    <div className="card-clean p-6 w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Analisis Kelayakan Aktivitas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi performa koneksi untuk aplikasi dan aktivitas internet sehari-hari
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-md border font-medium text-xs ${evaluations.badgeStyle}`}>
          Status: {evaluations.grade}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {evaluations.items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isComplete
                  ? item.passed
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/30 border-rose-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  {isComplete ? (
                    item.passed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Memenuhi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                        <XCircle className="w-4 h-4 text-rose-600" /> Kurang
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Menunggu tes</span>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {item.req}
                </p>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/60 font-num">
                Hasil: {isComplete ? item.detail : '—'}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
