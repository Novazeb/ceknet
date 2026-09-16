import React from 'react';
import { Activity, Play, RotateCcw } from 'lucide-react';

export default function Header({ isTesting, currentStage, onStartTest }) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Monospace Label */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100 text-zinc-950 font-bold text-xs">
            CN
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-base text-zinc-100 tracking-tight">
              ceknet
            </span>
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
              // internet speed diagnostic
            </span>
          </div>
        </div>

        {/* Live Stage Pill & Quick CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isTesting
                  ? 'bg-amber-400 animate-ping'
                  : currentStage === 'complete'
                  ? 'bg-emerald-400'
                  : 'bg-zinc-600'
              }`}
            />
            <span className="uppercase">{isTesting ? currentStage : currentStage === 'complete' ? 'selesai' : 'siap'}</span>
          </div>

          <button
            onClick={onStartTest}
            disabled={isTesting}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              isTesting
                ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
          >
            {isTesting ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isTesting ? 'PENGUJIAN' : 'MULAI TES'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
