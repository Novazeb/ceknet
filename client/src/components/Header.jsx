import React from 'react';
import { Activity, Play, RotateCcw } from 'lucide-react';

export default function Header({ isTesting, currentStage, onStartTest }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-8 py-3.5 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              ceknet
              <span className="text-xs font-normal text-slate-500 font-sans border-l border-slate-200 pl-2">
                Uji Kecepatan & Diagnostik Jaringan
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls & Live Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <span className={`w-2 h-2 rounded-full ${isTesting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span>Status: <strong className="text-slate-900 uppercase font-semibold">{isTesting ? currentStage : 'Siap'}</strong></span>
          </div>

          <button
            onClick={onStartTest}
            disabled={isTesting}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              isTesting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs cursor-pointer'
            }`}
          >
            {isTesting ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Pengujian Berlangsung...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Tes</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
