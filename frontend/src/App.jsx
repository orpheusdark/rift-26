import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Upload from './components/Upload';
import Graph from './components/Graph';
import Table from './components/Table';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import SuspiciousTable from './components/SuspiciousTable';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleDataReceived = (data) => {
    setAnalysisData(data);
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
        return <Table data={analysisData} />;
      case 'suspicious':
        return <SuspiciousTable data={analysisData} />;
      case 'analytics':
        return (
          <div className="max-w-2xl">
            <Charts data={analysisData} />
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Reports</h2>
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
                <Graph data={analysisData} />
              </div>
              <div className="xl:col-span-1">
                <Charts data={analysisData} />
              </div>
            </div>

            {/* Suspicious Accounts Table */}
            <SuspiciousTable data={analysisData} />

            {/* Fraud Rings Table */}
            <Table data={analysisData} />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Financial Forensics Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Money Mule Detection &amp; Financial Forensics System</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors relative">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {analysisData && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {/* Settings */}
            <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {/* User profile */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Nirant Chavda
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderSection()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">FlowLock &copy; 2026 — Team DeadLock</p>
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
