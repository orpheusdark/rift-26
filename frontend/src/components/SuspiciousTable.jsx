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
  fan_in: 'Fan-in (aggregator): 10+ unique senders deposit into this account within a 72-hour window — classic smurfing aggregation.',
  fan_out: 'Fan-out (disperser): this account disperses funds to 10+ unique receivers — rapid layering to avoid reporting thresholds.',
  shell_account: 'Shell account: low transaction count (≤3) with both incoming and outgoing flow — typical pass-through layering node.',
  high_velocity: 'High-velocity transactions: many transactions within a 72-hour window — rapid fund movement.',
  amount_anomaly: 'Unusual transaction amounts detected relative to the dataset average (statistical outlier).',
};

const cycleExplanation = (pattern) =>
  `Circular fund routing (${pattern.replace(/_/g, ' ')}): account is part of a money-laundering loop.`;

const SuspiciousTable = ({ data, onHighlight }) => {
  const [selected, setSelected] = useState(null);

  const accounts = data?.suspicious_accounts || [];

  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Suspicious Accounts</h2>
        <div className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">
          No suspicious accounts detected. Upload a CSV file to begin analysis.
        </div>
      </div>
    );
  }

  const selectedAccount = selected != null ? accounts.find((a) => a.account_id === selected) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Suspicious Accounts</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 dark:bg-slate-900 text-slate-200 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-semibold">Account ID</th>
              <th className="px-4 py-3 text-left font-semibold">Suspicion Score</th>
              <th className="px-4 py-3 text-left font-semibold">Detected Patterns</th>
              <th className="px-4 py-3 text-left font-semibold">Ring ID</th>
              <th className="px-4 py-3 text-left font-semibold">Risk Severity</th>
              <th className="px-4 py-3 text-left font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {accounts.map((acc) => {
              const { label, cls } = severityLabel(acc.suspicion_score);
              const isSelected = selected === acc.account_id;
              return (
                <tr
                  key={acc.account_id}
                  className={`${rowBg(acc.suspicion_score)} ${isSelected ? 'ring-2 ring-inset ring-blue-400' : ''} hover:brightness-95 dark:hover:brightness-110 transition-all`}
                >
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800 dark:text-gray-100">{acc.account_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-red-500"
                          style={{ width: `${acc.suspicion_score}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{acc.suspicion_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {acc.detected_patterns.map((p) => {
                        const tip = p.startsWith('cycle_') ? cycleExplanation(p) : (patternExplanations[p] || 'Suspicious behaviour detected.');
                        return (
                          <span
                            key={p}
                            title={tip}
                            className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium cursor-help"
                          >
                            {p}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-purple-700 dark:text-purple-400 text-xs">
                    {acc.ring_id || <span className="text-gray-400 dark:text-gray-500">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelected(isSelected ? null : acc.account_id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium underline"
                      >
                        {isSelected ? 'Hide' : 'Why Flagged?'}
                      </button>
                      {onHighlight && (
                        <button
                          onClick={() => onHighlight([acc.account_id])}
                          title="Highlight this account in the graph"
                          className="flex items-center gap-1 px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-xs font-medium transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Graph
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Why Flagged? Panel */}
      {selectedAccount && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              Why was <span className="font-mono text-blue-700 dark:text-blue-400">{selectedAccount.account_id}</span> flagged?
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {selectedAccount.detected_patterns.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500 font-bold">•</span>
                <span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-400 font-semibold">{p}</span>
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
                  <span className="font-mono text-purple-700 dark:text-purple-400">{selectedAccount.ring_id}</span>.
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
