const SummaryCards = ({ summary }) => {
  const cards = [
    {
      label: 'Total Accounts Analyzed',
      value: summary?.total_accounts_analyzed ?? '—',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      label: 'Suspicious Accounts Flagged',
      value: summary?.suspicious_accounts_flagged ?? '—',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
      color: 'from-red-500 to-rose-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
    },
    {
      label: 'Fraud Rings Detected',
      value: summary?.fraud_rings_detected ?? '—',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: 'from-purple-500 to-violet-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
    },
    {
      label: 'Processing Time (sec)',
      value: summary?.processing_time_seconds != null ? `${summary.processing_time_seconds}s` : '—',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-teal-500 to-emerald-500',
      bg: 'bg-teal-50',
      text: 'text-teal-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow`}>
            {card.icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
