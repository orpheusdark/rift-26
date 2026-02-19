import { useState } from 'react';

const severityLabel = (score) => {
  if (score >= 80) return { label: 'Critical', cls: 'bg-red-100 text-red-700' };
  if (score >= 60) return { label: 'High', cls: 'bg-orange-100 text-orange-700' };
  if (score >= 40) return { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Low', cls: 'bg-green-100 text-green-700' };
};

const rowBg = (score) => {
  if (score >= 80) return 'bg-red-50';
  if (score >= 60) return 'bg-orange-50';
  if (score >= 40) return 'bg-yellow-50';
  return '';
};

const patternExplanations = {
  smurfing: 'Smurfing / fan-out pattern: account disperses funds to many receivers to evade reporting thresholds.',
  shell_account: 'Shell account behaviour: low transaction count with one-directional flow (pass-through node).',
  high_velocity: 'High-velocity transactions: many transactions in a short time window — rapid layering.',
  amount_anomaly: 'Unusual transaction amounts detected relative to the dataset average (statistical outlier).',
};

const cycleExplanation = (pattern) =>
  `Circular fund routing (${pattern.replace(/_/g, ' ')}): account is part of a money-laundering loop.`;

const SuspiciousTable = ({ data }) => {
  const [selected, setSelected] = useState(null);

  const accounts = data?.suspicious_accounts || [];

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Suspicious Accounts</h2>
        <div className="text-center text-gray-400 py-10 text-sm">
          No suspicious accounts detected. Upload a CSV file to begin analysis.
        </div>
      </div>
    );
  }

  const selectedAccount = selected != null ? accounts.find((a) => a.account_id === selected) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Suspicious Accounts</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-200 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-semibold">Account ID</th>
              <th className="px-4 py-3 text-left font-semibold">Suspicion Score</th>
              <th className="px-4 py-3 text-left font-semibold">Detected Patterns</th>
              <th className="px-4 py-3 text-left font-semibold">Ring ID</th>
              <th className="px-4 py-3 text-left font-semibold">Risk Severity</th>
              <th className="px-4 py-3 text-left font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((acc) => {
              const { label, cls } = severityLabel(acc.suspicion_score);
              const isSelected = selected === acc.account_id;
              return (
                <tr
                  key={acc.account_id}
                  className={`${rowBg(acc.suspicion_score)} ${isSelected ? 'ring-2 ring-inset ring-blue-400' : ''} hover:brightness-95 transition-all`}
                >
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">{acc.account_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-red-500"
                          style={{ width: `${acc.suspicion_score}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-700">{acc.suspicion_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {acc.detected_patterns.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-purple-700 text-xs">
                    {acc.ring_id || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(isSelected ? null : acc.account_id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                    >
                      {isSelected ? 'Hide' : 'Why Flagged?'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Why Flagged? Panel */}
      {selectedAccount && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-gray-800 text-sm">
              Why was <span className="font-mono text-blue-700">{selectedAccount.account_id}</span> flagged?
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {selectedAccount.detected_patterns.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500 font-bold">•</span>
                <span>
                  <span className="font-mono text-indigo-700 font-semibold">{p}</span>
                  {' — '}
                  {p.startsWith('cycle_') ? cycleExplanation(p) : patternExplanations[p] || 'Suspicious behaviour detected.'}
                </span>
              </li>
            ))}
            {selectedAccount.ring_id && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-purple-500 font-bold">•</span>
                <span>
                  <span className="font-semibold">Network Behaviour:</span> Member of fraud ring{' '}
                  <span className="font-mono text-purple-700">{selectedAccount.ring_id}</span>.
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-orange-500 font-bold">•</span>
              <span>
                <span className="font-semibold">Suspicion Score:</span>{' '}
                {selectedAccount.suspicion_score}/100 — {severityLabel(selectedAccount.suspicion_score).label} risk.
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SuspiciousTable;
