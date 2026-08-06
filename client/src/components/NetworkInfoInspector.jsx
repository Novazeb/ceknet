import React from 'react';
import { Globe, MapPin, Server, Cpu } from 'lucide-react';

export default function NetworkInfoInspector({ info, isLoading }) {
  const browserConn = info?.browserConnection || {};

  return (
    <div className="card-clean p-6 w-full">
      
      {/* Inspector Header */}
      <div className="mb-5 pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Informasi Jaringan & ISP
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detail alamat IP publik, penyedia layanan internet, dan informasi koneksi lokal
        </p>
      </div>

      {/* Grid Inspector Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* IP Address */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold uppercase">IP Publik</span>
          </div>
          <div className="text-base font-semibold font-num text-slate-900 truncate">
            {isLoading ? 'Memuat...' : (info?.ip || '127.0.0.1')}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Protokol IPv4 / IPv6
          </div>
        </div>

        {/* ISP Provider */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
            <Server className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold uppercase">Penyedia ISP</span>
          </div>
          <div className="text-sm font-semibold text-slate-900 truncate" title={info?.isp}>
            {isLoading ? 'Memuat...' : (info?.isp || 'Penyedia Layanan')}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">
            {info?.as || 'Jaringan Otonom'}
          </div>
        </div>

        {/* Location */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-semibold uppercase">Lokasi Server</span>
          </div>
          <div className="text-sm font-semibold text-slate-900 truncate">
            {isLoading ? 'Memuat...' : `${info?.city || 'Kota'}, ${info?.country || 'Negara'}`}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {info?.region ? `${info.region} (${info.countryCode})` : 'GeoIP Location'}
          </div>
        </div>

        {/* Browser Connection Inspector */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold uppercase">Browser Network</span>
          </div>
          <div className="text-sm font-semibold font-num text-slate-900">
            {browserConn.effectiveType ? browserConn.effectiveType.toUpperCase() : '4G'} • {browserConn.downlink || 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 font-num">
            RTT Estimasi: {browserConn.rtt || 'N/A'}
          </div>
        </div>

      </div>

    </div>
  );
}
