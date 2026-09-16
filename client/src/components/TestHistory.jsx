import React from 'react';
import { History, Download, Trash2 } from 'lucide-react';

export default function TestHistory({ history = [], onClearHistory }) {
  // Export history to CSV
  const handleExportCSV = () => {
    if (!history.length) return;

    const headers = ['Timestamp', 'IP', 'ISP', 'Ping (ms)', 'Jitter (ms)', 'Download (Mbps)', 'Upload (Mbps)', 'Status'];
    const rows = history.map((item) => [
      `"${item.timestamp}"`,
      `"${item.ip || 'N/A'}"`,
      `"${item.isp || 'N/A'}"`,
      item.ping,
      item.jitter,
      item.downloadSpeed,
      item.uploadSpeed,
      `"${item.status || 'Completed'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ceknet_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (history.length === 0) return null;

  return (
    <div className="surface p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
            Diagnostic History ({history.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 cursor-pointer transition-colors"
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-500 hover:text-rose-400 bg-zinc-900 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/30 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>CLEAR</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800/60 text-zinc-500 text-[11px]">
              <th className="py-2 px-2.5">Timestamp</th>
              <th className="py-2 px-2.5">Ping</th>
              <th className="py-2 px-2.5">Jitter</th>
              <th className="py-2 px-2.5 text-emerald-400">Download</th>
              <th className="py-2 px-2.5 text-sky-400">Upload</th>
              <th className="py-2 px-2.5">ISP / IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 font-num">
            {history.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/40 transition-colors text-zinc-300">
                <td className="py-2 px-2.5 text-zinc-500 whitespace-nowrap text-[11px]">
                  {row.timestamp}
                </td>
                <td className="py-2 px-2.5">
                  {row.ping} ms
                </td>
                <td className="py-2 px-2.5">
                  {row.jitter} ms
                </td>
                <td className="py-2 px-2.5 font-semibold text-emerald-400">
                  {row.downloadSpeed} Mbps
                </td>
                <td className="py-2 px-2.5 font-semibold text-sky-400">
                  {row.uploadSpeed} Mbps
                </td>
                <td className="py-2 px-2.5 text-zinc-400 truncate max-w-[160px] text-[11px]">
                  {row.isp || row.ip || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
