import { useState } from 'react';

const Table = ({ data, onHighlight }) => {
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [copiedRing, setCopiedRing] = useState(null);

  const handleCopyIds = (ring) => {
    const ids = ring.member_accounts.join(', ');
    navigator.clipboard.writeText(ids).then(() => {
      setCopiedRing(ring.ring_id);
      setTimeout(() => setCopiedRing(null), 1500);
    });
  };

  if (!data || !data.fraud_rings || data.fraud_rings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Fraud Ring Summary</h2>
        <div className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">
          No fraud rings detected. Upload a CSV file to analyse transactions.
        </div>
      </div>
    );
  }

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setSortOrder('desc'); }
  };

  const sortedRings = [...data.fraud_rings].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'risk_score':
        aVal = typeof a.risk_score === 'number' ? a.risk_score : 0;
        bVal = typeof b.risk_score === 'number' ? b.risk_score : 0;
        break;
      case 'ring_id': aVal = a.ring_id; bVal = b.ring_id; break;
      case 'pattern_type': aVal = a.pattern_type; bVal = b.pattern_type; break;
      case 'member_count': aVal = a.member_accounts.length; bVal = b.member_accounts.length; break;
      default: return 0;
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownload = () => {
    const output = {
      suspicious_accounts: data.suspicious_accounts,
      fraud_rings: data.fraud_rings,
      summary: data.summary,
    };
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowlock_report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return (
      <svg className="w-3.5 h-3.5 ml-1 inline text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return sortOrder === 'asc' ? (
      <svg className="w-3.5 h-3.5 ml-1 inline text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 ml-1 inline text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Fraud Ring Summary</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download JSON Report
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 dark:bg-slate-900 text-slate-200 text-xs uppercase tracking-wider">
              {[
                { key: 'ring_id', label: 'Ring ID' },
                { key: 'pattern_type', label: 'Pattern Type' },
                { key: 'member_count', label: 'Member Count' },
                { key: 'risk_score', label: 'Risk Score' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  <SortIcon column={key} />
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold">Member Account IDs</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedRings.map((ring, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-gray-700/40 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-purple-700 dark:text-purple-400">{ring.ring_id}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                    {ring.pattern_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">{ring.member_accounts.length}</td>
                <td className="px-4 py-3">
                  {typeof ring.risk_score === 'number' ? (
                    <span className={`font-semibold ${ring.risk_score >= 80 ? 'text-red-600' : ring.risk_score >= 60 ? 'text-orange-600' : ring.risk_score >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {ring.risk_score.toFixed(1)}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">
                  {ring.member_accounts.join(', ')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyIds(ring)}
                      title="Copy member account IDs to clipboard"
                      className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 rounded text-xs font-medium transition-colors"
                    >
                      {copiedRing === ring.ring_id ? (
                        <>
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy IDs
                        </>
                      )}
                    </button>
                    {onHighlight && (
                      <button
                        onClick={() => onHighlight(ring.member_accounts)}
                        title="Highlight ring members in graph"
                        className="flex items-center gap-1 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Highlight Ring
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
