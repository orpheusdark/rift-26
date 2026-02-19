import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Upload from './components/Upload';
import Graph from './components/Graph';
import Table from './components/Table';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import SuspiciousTable from './components/SuspiciousTable';
import Notification from './components/Notification';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDataReceived = (data) => {
    setAnalysisData(data);
    setHighlightedIds([]);
    setActiveSection('dashboard');
  };

  const handleHighlight = (ids) => {
    setHighlightedIds(ids);
    setActiveSection('dashboard');
  };

  const handleDownloadJSON = () => {
    if (!analysisData) return;
    const output = {
      suspicious_accounts: analysisData.suspicious_accounts,
      fraud_rings: analysisData.fraud_rings,
      summary: analysisData.summary,
    };
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowlock_report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (!analysisData) return;
    const rows = [
      ['account_id', 'suspicion_score', 'detected_patterns', 'ring_id'],
      ...(analysisData.suspicious_accounts || []).map((a) => [
        a.account_id,
        a.suspicion_score,
        a.detected_patterns.join(' | '),
        a.ring_id,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowlock_investigation.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return (
          <div className="max-w-2xl">
            <Upload onDataReceived={handleDataReceived} />
          </div>
        );
      case 'fraud-rings':
        return <Table data={analysisData} onHighlight={handleHighlight} />;
      case 'suspicious':
        return <SuspiciousTable data={analysisData} onHighlight={handleHighlight} />;
      case 'analytics':
        return (
          <div className="max-w-2xl">
            <Charts data={analysisData} />
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Reports</h2>
            <div className="flex flex-col gap-3 max-w-xs">
              <button
                onClick={handleDownloadJSON}
                disabled={!analysisData}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download JSON Report
              </button>
              <button
                onClick={handleExport}
                disabled={!analysisData}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Investigation (CSV)
              </button>
            </div>
          </div>
        );
      default: // dashboard
        return (
          <div className="space-y-5">
            {/* Upload + Summary */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-1">
                <Upload onDataReceived={handleDataReceived} />
              </div>
              <div className="xl:col-span-2 flex items-center">
                <div className="w-full">
                  <SummaryCards summary={analysisData?.summary} />
                </div>
              </div>
            </div>

            {/* Graph + Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <Graph data={analysisData} highlightedIds={highlightedIds} />
              </div>
              <div className="xl:col-span-1">
                <Charts data={analysisData} />
              </div>
            </div>

            {/* Suspicious Accounts Table */}
            <SuspiciousTable data={analysisData} onHighlight={handleHighlight} />

            {/* Fraud Rings Table */}
            <Table data={analysisData} onHighlight={handleHighlight} />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20 pl-14 md:pl-6">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Financial Forensics Dashboard
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Money Mule Detection &amp; Financial Forensics System</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification */}
            <Notification data={analysisData} onHighlight={handleHighlight} />
            {/* Settings / Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderSection()}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">FlowLock &copy; 2026 — Team DeadLock</p>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadJSON}
              disabled={!analysisData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download JSON Report
            </button>
            <button
              onClick={handleExport}
              disabled={!analysisData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Investigation
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
