# 🔐 RIFT-26  
## 💸 MONEY MULING DETECTION CHALLENGE
**Graph-Based Financial Crime Detection Engine**

---

## 🧠 Overview

RIFT-26 is a full-stack financial crime detection platform built for identifying complex financial fraud using graph analytics and network intelligence.

It combines:

- ⚙️ FastAPI backend for high-performance fraud analysis  
- 🌐 React frontend for interactive visualization  
- 🕸 Graph algorithms for detecting fraud rings and anomalies  

The system detects structured financial crimes such as fraud rings, smurfing chains, shell accounts, and velocity anomalies within transaction networks.

---
# Live Demo 

https://rift-26-frontend.onrender.com/
https://rift-26-j7ex.onrender.com/

---

# Tech Stack 

## ⚙️ Backend – Fraud Detection Engine (FastAPI)
### 📂 CSV Processing
- Parses transaction datasets
- Builds directed transaction graph
- Automatic schema validation

### 🕸 Graph-Based Pattern Detection

Detects:

- 🔁 **Cycle Rings** (Strongly Connected Components)
- 🪙 **Smurfing Patterns** (Money splitting behavior)
- 🏢 **Shell Accounts** (High out-degree, low in-degree)
- ⚡ **Velocity Anomalies** (High-frequency transaction bursts)

### 📊 Risk Scoring Engine
Each suspicious cluster is evaluated using:

- Structural connectivity
- Transaction density
- Temporal proximity
- Node centrality metrics
- Composite risk scoring

 --- 

## 🌐 Frontend – Interactive Intelligence Dashboard

### 📤 CSV Upload Component

- Drag & drop file upload  
- Real-time processing spinner  
- Execution time display  
---
### 🕸 Interactive Graph Visualization 

- 🔵 **Blue Nodes** → Normal accounts  
- 🔴 **Red Nodes** → Suspicious accounts  
- 🔁 Cycle highlights  
- 🖱 Hover tooltips with account metrics  
- 🔍 Zoom & pan controls  
- ⚡ Real-time rendering
- 
### 📋 Fraud Rings Table

- Sortable columns  
- Risk score heat indicators  
- Cluster size metrics  
- JSON export functionality  
- Summary statistics  

---

# System Architecture

# Algorithm Approach 
# Suspicion Score Methodology
# Installation & Setup
# Usage Instructions
- Start backend server
- Start frontend server
- Open browser → http://localhost:3000
- Upload transaction CSV file
- Click Analyze
- View:
  - Interactive network grap
  - Suspicious accounts
  - Fraud rings table
  - Risk scores
- Export results as JSON
  
---

# Known Limitations 
 - No authentication layer implemented.
 - Performance drop for very large datasets
---

# Team Members
- Nirant Chavda
- Rhythm  Chavda


© 2026 RIFT PUNE

