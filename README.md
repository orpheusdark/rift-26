# 🔐 RIFT-26 - Team Deadlock 
## 💸 MONEY MULING DETECTION CHALLENGE
**Graph-Based Financial Crime Detection Engine**

---

## 🧠 Overview

Flowlock is a full-stack financial crime detection platform built for identifying complex financial fraud using graph analytics and network intelligence.

It combines:

- ⚙️ FastAPI backend for high-performance fraud analysis  
- 🌐 React frontend for interactive visualization  
- 🕸 Graph algorithms for detecting fraud rings and anomalies  

The system detects structured financial crimes such as fraud rings, smurfing chains and  shell accounts within transaction networks.

---
# Live Demo 

https://rift-26-frontend.onrender.com/

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
  
### 📋 Fraud Rings Table

- Sortable columns  
- Risk score heat indicators  
- Cluster size metrics  
- JSON export functionality  
- Summary statistics  

---

# System Architecture
<img width="2816" height="1536" alt="System Architecture" src="https://github.com/user-attachments/assets/80a4d155-107f-42fc-ab84-0aa8a6ca4f6b" />

# Algorithm Approach 
1. Load and clean transaction data.
2. Build account profiles (total sent, received, transaction count, time gap).
3. Calculate risk indicators:
   - Pass-through ratio (sent / received)
   - Transaction velocity (receive → send time gap)
   - Network position (middle-layer behavior)
   - Activity spike detection
4. Construct transaction graph (accounts as nodes, transactions as edges).
5. Compute final suspicion score.
6. Flag accounts above risk threshold.

# Suspicion Score Methodology

## 🚀 Our Solution

We uncover hidden money mule accounts by turning transaction behavior into a clear, measurable risk score.

## 📊 How We Score (0–100)

Higher Score → Higher Mule Risk  

Instead of labeling accounts as simply fraud or not,  
we evaluate behavior using four weighted signals:

---

### 🔁 Pass-Through Ratio (40%)
If an account sends almost everything it receives → 🚨 High suspicion

### ⚡ Transaction Velocity (30%)
Money moves out immediately after coming in → 🚨 Higher risk

### 🌐 Network Position (20%)
Acts as a middle layer in chains  
Example: A → **B** → C (B only forwards money)

### 📈 Activity Spike (10%)
Sudden heavy transactions after inactivity → 🚨 Suspicious

---
---

##  Final Score Formula

Suspicion Score =  
(Pass-Through × 0.4) +  
(Velocity × 0.3) +  
(Network Score × 0.2) +  
(Activity Spike × 0.1)

---

##  Risk Classification

- 0–30 → Low Risk  
- 31–60 → Medium Risk  
- 61–80 → High Risk  
- 81–100 → Critical Risk  

Accounts above the defined threshold are flagged for review.

---

# Installation & Setup
- Python 3.8 or above  
- pip (Python package manager)  
- Git 

Recommended Libraries:
- pandas  
- numpy  
- networkx  
- matplotlib  

---

## Clone the Repository

If using Git:

git clone https://github.com/orpheurdark/rift-26.git  
cd rift-26 

Or download the ZIP file and extract it.

---

##  Create Virtual Environment (Recommended)

python -m venv venv  

Activate:

Windows:
venv\Scripts\activate  

Mac/Linux:
source venv/bin/activate  

---

##  Install Dependencies

pip install -r requirements.txt  

Or manually install:

pip install pandas numpy networkx matplotlib  

---


##  Run the Project

python main.py  

The system will:

- Load transactions  
- Calculate account profiles  
- Compute suspicion scores  
- Flag high-risk accounts  
- Generate output report  

---

##  Output Location

Results will be saved in:

/output/  

Includes:
- Suspicious accounts report (CSV)  
- Risk score summary  
- Transaction graph visualization  

---
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
