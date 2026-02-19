# Financial Crime Detection Frontend

A React + Vite + TailwindCSS frontend application for detecting financial crimes and fraud rings.

## Features

- **CSV Upload**: Drag-and-drop or select CSV files for analysis
- **Graph Visualization**: Interactive network graph using Cytoscape.js showing transaction flows
- **Fraud Rings Table**: Sortable table displaying detected fraud rings with risk scores

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on http://localhost:8000

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to http://localhost:3000

3. Make sure the backend API is running on http://localhost:8000

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Components

- **Upload.jsx**: Handles CSV file upload with drag-and-drop functionality
- **Graph.jsx**: Renders the transaction network graph with Cytoscape.js
- **Table.jsx**: Displays fraud rings in a sortable table

## Technologies Used

- React 18
- Vite 5
- TailwindCSS 3
- Cytoscape.js
- Axios
