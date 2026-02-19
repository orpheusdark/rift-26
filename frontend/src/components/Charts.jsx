import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell
} from 'recharts';

const riskBuckets = (suspiciousAccounts) => {
  const buckets = { '0–20': 0, '21–40': 0, '41–60': 0, '61–80': 0, '81–100': 0 };
  (suspiciousAccounts || []).forEach(({ suspicion_score }) => {
    if (suspicion_score <= 20) buckets['0–20']++;
    else if (suspicion_score <= 40) buckets['21–40']++;
    else if (suspicion_score <= 60) buckets['41–60']++;
    else if (suspicion_score <= 80) buckets['61–80']++;
    else buckets['81–100']++;
  });
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
};

const bucketColor = (range) => {
  const map = { '0–20': '#22c55e', '21–40': '#84cc16', '41–60': '#eab308', '61–80': '#f97316', '81–100': '#ef4444' };
  return map[range] || '#6366f1';
};

const txActivityData = (graphEdges) => {
  if (!graphEdges || graphEdges.length === 0) return [];
  // Simulate per-node transaction activity from edge weights
  const nodeActivity = {};
  graphEdges.forEach(({ source, target, weight }) => {
    nodeActivity[source] = (nodeActivity[source] || 0) + 1;
    nodeActivity[target] = (nodeActivity[target] || 0) + 1;
  });
  return Object.entries(nodeActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([account, txCount]) => ({ account: account.slice(-6), txCount }));
};

const Charts = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-72 text-gray-400 text-sm">
        Upload a CSV file to view analytics charts
      </div>
    );
  }

  const riskData = riskBuckets(data.suspicious_accounts);
  const activityData = txActivityData(data.graph_edges);

  return (
    <div className="flex flex-col gap-4">
      {/* Risk Score Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Score Distribution</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={riskData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(v) => [v, 'Accounts']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {riskData.map((entry) => (
                <Cell key={entry.range} fill={bucketColor(entry.range)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-3 mt-2 flex-wrap">
          {riskData.map((b) => (
            <span key={b.range} className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: bucketColor(b.range) }} />
              {b.range}
            </span>
          ))}
        </div>
      </div>

      {/* Transaction Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Account Transaction Activity</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={activityData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="account" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(v) => [v, 'Tx Count']}
            />
            <Line
              type="monotone"
              dataKey="txCount"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6366f1' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
