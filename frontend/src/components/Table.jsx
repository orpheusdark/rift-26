import { useState } from 'react';

const Table = ({ data }) => {
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');

  if (!data || !data.fraud_rings || data.fraud_rings.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Fraud Rings</h2>
        <div className="text-center text-gray-500 py-8">
          No fraud rings detected. Upload a CSV file to analyze transactions.
        </div>
      </div>
    );
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedRings = [...data.fraud_rings].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'risk_score':
        // Handle risk_score as object or number
        aVal = typeof a.risk_score === 'object' ? a.risk_score.transaction_count : a.risk_score;
        bVal = typeof b.risk_score === 'object' ? b.risk_score.transaction_count : b.risk_score;
        break;
      case 'ring_id':
        aVal = a.ring_id;
        bVal = b.ring_id;
        break;
      case 'pattern_type':
        aVal = a.pattern_type;
        bVal = b.pattern_type;
        break;
      case 'member_count':
        aVal = a.member_accounts.length;
        bVal = b.member_accounts.length;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownload = () => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fraud_detection_results.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 ml-1 inline text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 ml-1 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Fraud Rings</h2>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
        >
          Download JSON
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ring_id')}
              >
                Ring ID
                <SortIcon column="ring_id" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pattern_type')}
              >
                Pattern Type
                <SortIcon column="pattern_type" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('member_count')}
              >
                Member Count
                <SortIcon column="member_count" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('risk_score')}
              >
                Risk Score
                <SortIcon column="risk_score" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member Account IDs
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRings.map((ring, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ring.ring_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {ring.pattern_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ring.member_accounts.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof ring.risk_score === 'object' ? (
                    <div className="text-xs">
                      <div>Txns: {ring.risk_score.transaction_count}</div>
                      <div>Vol: ${ring.risk_score.incoming_total.toFixed(0)}</div>
                    </div>
                  ) : (
                    <span className={`font-semibold ${ring.risk_score > 70 ? 'text-red-600' : ring.risk_score > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {ring.risk_score.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs overflow-x-auto">
                    {ring.member_accounts.join(', ')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.summary && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Accounts:</span>
              <span className="ml-2 font-semibold">{data.summary.total_accounts_analyzed}</span>
            </div>
            <div>
              <span className="text-gray-600">Suspicious:</span>
              <span className="ml-2 font-semibold text-red-600">{data.summary.suspicious_accounts_flagged}</span>
            </div>
            <div>
              <span className="text-gray-600">Fraud Rings:</span>
              <span className="ml-2 font-semibold text-purple-600">{data.summary.fraud_rings_detected}</span>
            </div>
            <div>
              <span className="text-gray-600">Processing Time:</span>
              <span className="ml-2 font-semibold">{data.summary.processing_time_seconds}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
