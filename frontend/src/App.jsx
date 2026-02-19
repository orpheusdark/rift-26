import { useState } from 'react';
import Upload from './components/Upload';
import Graph from './components/Graph';
import Table from './components/Table';

function App() {
  const [analysisData, setAnalysisData] = useState(null);

  const handleDataReceived = (data) => {
    setAnalysisData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Financial Crime Detection System
          </h1>
          <p className="text-center text-gray-600">
            Upload transaction data to detect fraud rings and suspicious patterns
          </p>
        </header>

        <div className="space-y-6">
          {/* Upload Section */}
          <Upload onDataReceived={handleDataReceived} />

          {/* Graph Visualization Section */}
          <Graph data={analysisData} />

          {/* Fraud Rings Table Section */}
          <Table data={analysisData} />
        </div>

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>&copy; 2026 Financial Crime Detection Hackathon</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
