import { useState } from 'react';

const Table = ({ data }) => {
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');

  if (!data || !data.fraud_rings || data.fraud_rings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Fraud Ring Summary</h2>
        <div className="text-center text-gray-400 py-10 text-sm">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-800">Fraud Ring Summary</h2>
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

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-200 text-xs uppercase tracking-wider">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedRings.map((ring, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-purple-700">{ring.ring_id}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {ring.pattern_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 font-semibold">{ring.member_accounts.length}</td>
                <td className="px-4 py-3">
                  {typeof ring.risk_score === 'number' ? (
                    <span className={`font-semibold ${ring.risk_score >= 80 ? 'text-red-600' : ring.risk_score >= 60 ? 'text-orange-600' : ring.risk_score >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {ring.risk_score.toFixed(1)}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                  {ring.member_accounts.join(', ')}
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
