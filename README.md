# rift-26

Financial Crime Detection Hackathon - Full Stack Application

## Project Overview

This project implements a complete financial crime detection system with:
- **Backend**: FastAPI-based fraud detection engine with graph analysis algorithms
- **Frontend**: React + Vite + TailwindCSS single-page application for visualization

## Features

### Backend (FastAPI)
- CSV transaction data processing
- Graph-based fraud detection algorithms
- Pattern detection: cycles, smurfing, shell accounts, velocity anomalies
- Risk scoring system
- RESTful API endpoint: `/analyze`

### Frontend (React + Vite)
1. **CSV Upload Component**
   - Drag-and-drop file upload
   - Real-time processing with spinner
   - Processing time display
   
2. **Graph Visualization**
   - Interactive Cytoscape.js network graph
   - Color-coded nodes (blue=normal, red=suspicious)
   - Cycle detection with visual highlights
   - Hover tooltips with account details
   - Zoom and pan controls

3. **Fraud Rings Table**
   - Sortable columns
   - Risk score visualization
   - JSON export functionality
   - Summary statistics

## Getting Started

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000
The backend API will be available at http://localhost:8000

## Technology Stack

### Backend
- FastAPI
- Pandas
- NetworkX
- Scipy

### Frontend
- React 18
- Vite 5
- TailwindCSS 3
- Cytoscape.js
- Axios

## Usage

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Upload a CSV file with transaction data (columns: sender_id, receiver_id, amount, timestamp)
4. View the graph visualization and fraud detection results
5. Sort and analyze fraud rings in the table
6. Download results as JSON

## CSV Format

Your CSV file should have the following columns:
- `sender_id`: Account ID of the sender
- `receiver_id`: Account ID of the receiver
- `amount`: Transaction amount
- `timestamp`: Transaction timestamp (ISO 8601 format)

## License

© 2026 Financial Crime Detection Hackathon