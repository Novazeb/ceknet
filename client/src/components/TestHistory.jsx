import React from 'react';
import { History, Download, Trash2, HardDrive } from 'lucide-react';

export default function TestHistory({ history = [], onClearHistory }) {
  
  // Export history to CSV file
  const handleExportCSV = () => {
    if (!history.length) return;

    const headers = ['Waktu', 'IP', 'ISP', 'Ping (ms)', 'Jitter (ms)', 'Download (Mbps)', 'Upload (Mbps)', 'Status'];
    const rows = history.map((item) => [
      `"${item.timestamp}"`,
      `"${item.ip || 'N/A'}"`,
      `"${item.isp || 'N/A'}"`,
      item.ping,
      item.jitter,
      item.downloadSpeed,
      item.uploadSpeed,
      `"${item.status || 'Selesai'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ceknet_riwayat_speedtest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card-clean p-6 w-full">
      
      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            Riwayat Pengujian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar hasil pengujian sebelumnya tersimpan di peramban ini
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!history.length}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              history.length
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 cursor-pointer shadow-2xs'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onClearHistory}
            disabled={!history.length}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              history.length
                ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border-slate-200 hover:border-rose-200 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title="Hapus Riwayat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      {history.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
          <HardDrive className="w-7 h-7 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum Ada Riwayat</p>
          <p className="text-xs text-slate-500 mt-0.5">Klik tombol "Mulai Tes" untuk mulai menguji kecepatan internet Anda</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Ping</th>
                <th className="py-2.5 px-3">Jitter</th>
                <th className="py-2.5 px-3">Download</th>
                <th className="py-2.5 px-3">Upload</th>
                <th className="py-2.5 px-3">ISP / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-num">
              {history.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-700 font-sans whitespace-nowrap">
                    {row.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {row.ping} ms
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {row.jitter} ms
                  </td>
                  <td className="py-3 px-3 font-semibold text-blue-600">
                    {row.downloadSpeed} Mbps
                  </td>
                  <td className="py-3 px-3 font-semibold text-indigo-600">
                    {row.uploadSpeed} Mbps
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[160px] font-sans">
                    {row.isp || row.ip || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
