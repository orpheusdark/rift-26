import { useState } from 'react';
import axios from 'axios';

const Upload = ({ onDataReceived }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus(null);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('error');
      setStatusMsg('Please select a CSV file first.');
      return;
    }
    setLoading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://34.229.10.113:8000/analyze';
      const response = await axios.post(`${backendUrl}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setStatus('success');
      setStatusMsg(`File uploaded successfully — Analysis in progress…`);
      setTimeout(() => {
        setStatusMsg(`Analysis complete in ${response.data.summary.processing_time_seconds}s`);
      }, 500);
      onDataReceived(response.data);
    } catch (err) {
      setStatus('error');
      let msg;
      if (err.code === 'ECONNABORTED') {
        msg = 'Request timed out — the backend may be starting up. Please try again in a moment.';
      } else {
        msg = err.response?.data?.detail || 'Error analysing file. Please try again.';
      }
      setStatusMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Upload Transaction CSV</h2>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-gray-700/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input type="file" accept=".csv" onChange={handleChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-500 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">CSV files only (transaction_id, sender_id, receiver_id, amount, timestamp)</p>
        </label>
        {file && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {file.name}
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className={`mt-4 w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all shadow-sm ${
          loading || !file
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-md'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Analysing…
          </span>
        ) : (
        'Upload & Analyse'
        )}
      </button>

      {status === 'success' && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {statusMsg}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {statusMsg}
        </div>
      )}
    </div>
  );
};

export default Upload;
