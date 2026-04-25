<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<h1 align="center">🏥 MediQueue</h1>
<p align="center"><strong>Emergency-Aware Hospital Scheduling System</strong></p>
<p align="center">
  A full-stack healthcare scheduling platform built on custom data structures for real-time patient triage, greedy scheduling, and fairness analysis.
</p>
<p align="center"><em>DSAA Course Project — SY IoT, Semester 4</em></p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Data Structures](#-data-structures)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Login Credentials](#-login-credentials)
- [API Reference](#-api-reference)
- [Pages & Screenshots](#-pages--screenshots)
- [Algorithm Details](#-algorithm-details)
- [Contributors](#-contributors)

---

## 🔍 Overview

MediQueue is an emergency-aware hospital scheduling system designed to optimize patient throughput in emergency departments. It uses a **Max Heap** for priority-based triage, an **AVL Tree** for balanced appointment scheduling, a **Hash Table** for O(1) patient lookup, and a **Trie** for real-time name autocomplete — all implemented from scratch in Python without external data structure libraries.

The platform provides:
- **Real-time triage** with composite priority scoring
- **Greedy scheduling algorithm** for 15-minute appointment slots
- **Poisson-distributed arrival simulation** for stress testing
- **Strategy comparison** (Pure Urgency vs Aging-Based) with Jain's Fairness Index
- **Anti-starvation aging mechanism** to prevent indefinite waiting

---

## ✨ Features

| Module | Description | Data Structure |
|--------|-------------|----------------|
| **Dashboard** | Real-time queue monitoring with live activity log, auto-refresh every 2s | Max Heap |
| **Register Patient** | Composite priority scoring with urgency + age + wait bonuses | Max Heap + Hash Table + Trie |
| **Greedy Scheduler** | Optimal 15-min slot allocation using greedy algorithm | AVL Tree |
| **Arrival Simulation** | Poisson-distributed patient generator with configurable rate/duration | Max Heap |
| **Strategy Comparison** | Head-to-head Pure Urgency vs Aging-Based fairness analysis | Full pipeline |
| **Patient Lookup** | O(1) ID search + Trie prefix autocomplete | Hash Table + Trie |
| **Priority Aging** | +5 priority bonus per 10 minutes waiting | Max Heap rebuild |
| **Starvation Scenario** | 80% Critical flood test to expose fairness issues | Simulation engine |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.10+** | Core language |
| **FastAPI 0.115** | REST API framework |
| **Uvicorn** | ASGI server |
| **Pydantic** | Data validation |
| **APScheduler** | Background simulation tasks |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Recharts** | Data visualization (charts) |
| **React Router v6** | Client-side routing |
| **Material Symbols** | Icon system |
| **Inter (Google Fonts)** | Typography |

### Design System
- **"Clinical Precision"** — Dark navy sidebar (#001F3F) + white content area
- **4-tier urgency palette**: Critical (Red), High (Amber), Medium (Blue), Low (Green)
- **Inter** typography with JetBrains Mono for code/IDs

---

## 🏗 Data Structures

All data structures are implemented **from scratch** in `backend/structures/`:

### 1. Max Heap (`max_heap.py`)
- **Purpose**: Priority queue for patient triage
- **Operations**: `insert()` O(log n), `extract_max()` O(log n), `peek()` O(1)
- **Key Feature**: Maintains highest-priority patient at root for O(1) access

### 2. AVL Tree (`avl_tree.py`)
- **Purpose**: Self-balancing BST for appointment scheduling
- **Operations**: `insert()` O(log n), `search()` O(log n), `in_order()` O(n)
- **Key Feature**: Automatic rotations maintain O(log n) guaranteed height

### 3. Hash Table (`hash_table.py`)
- **Purpose**: Patient registry for instant ID lookup
- **Operations**: `set()` O(1) avg, `get()` O(1) avg, `delete()` O(1) avg
- **Key Feature**: Chaining-based collision resolution with dynamic resizing

### 4. Trie (`trie.py`)
- **Purpose**: Prefix tree for patient name autocomplete
- **Operations**: `insert()` O(k), `search()` O(k), `delete()` O(k)
- **Key Feature**: Returns all patient IDs matching a name prefix

---

## 📁 Project Structure

```
MediQueue/
├── backend/
│   ├── structures/           # Custom data structures (from scratch)
│   │   ├── max_heap.py       # Priority queue
│   │   ├── avl_tree.py       # Balanced BST for scheduling
│   │   ├── hash_table.py     # Patient registry
│   │   └── trie.py           # Name autocomplete
│   ├── main.py               # FastAPI app + all REST endpoints
│   ├── models.py             # Pydantic models + urgency levels
│   ├── scheduler.py          # Greedy scheduling + aging logic
│   ├── simulation.py         # Poisson arrival simulation engine
│   ├── comparison.py         # Strategy A vs B comparison
│   └── state.py              # Global application state
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Sidebar.jsx   # Dark navy navigation sidebar
│   │   │   ├── QueueTable.jsx# Live patient queue table
│   │   │   ├── StatsBar.jsx  # Dashboard stat cards
│   │   │   ├── UrgencyBadge.jsx # Triage level badges
│   │   │   └── FairnessGauge.jsx # SVG gauge for fairness index
│   │   ├── pages/            # Route-level page components
│   │   │   ├── Home.jsx      # Landing page
│   │   │   ├── Login.jsx     # Staff authentication
│   │   │   ├── Dashboard.jsx # Real-time queue monitoring
│   │   │   ├── Register.jsx  # Patient registration form
│   │   │   ├── Scheduler.jsx # Greedy scheduler interface
│   │   │   ├── Simulation.jsx# Arrival simulation controls
│   │   │   ├── Comparison.jsx# Strategy comparison analysis
│   │   │   └── Lookup.jsx    # Patient search (Hash + Trie)
│   │   ├── api/api.js        # Axios API client
│   │   ├── App.jsx           # Root layout + routing
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Design system tokens + global styles
│   ├── index.html            # HTML entry point
│   └── package.json          # Node dependencies
├── test_structures.py        # Unit tests for data structures
├── test_engines.py           # Unit tests for scheduling engines
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** installed
- **Node.js 18+** and **npm** installed
- **Git** installed

### 1. Clone the Repository

```bash
git clone https://github.com/Prathamesh-Patil-git/MediQueue.git
cd MediQueue
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. Open in Browser

Navigate to `http://localhost:5173` to access the landing page.

---

## 🔑 Login Credentials

> **This is a demo application.** Authentication is session-based — credentials are validated client-side against hardcoded user accounts. All dashboard routes are protected and require login.

### Available User Accounts

| # | Hospital ID | Email | Password | Role |
|---|-------------|-------|----------|------|
| 1 | `HOSP-001-01` | `doctor@mediqueue.org` | `admin@123` | Triage Supervisor |
| 2 | `HOSP-001-02` | `nurse@mediqueue.org` | `nurse@123` | Head Nurse |
| 3 | `HOSP-001-03` | `admin@mediqueue.org` | `superadmin@123` | System Administrator |

### How to Login

1. Navigate to `http://localhost:5173/login`
2. Enter the **Hospital ID**, **Email**, and **Password** from any row above
3. Click **Login** to access the dashboard
4. Use the **Logout** button in the sidebar to sign out

> **Note:** All dashboard routes (`/dashboard`, `/register`, `/scheduler`, `/simulation`, `/comparison`, `/lookup`) are **protected**. Accessing them without logging in will redirect you to the login page.

---

## 📡 API Reference

### Patient APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/patient/register` | Register a new patient |
| `GET` | `/patient/{id}` | Lookup by ID (Hash Table O(1)) |
| `DELETE` | `/patient/{id}` | Remove patient |
| `GET` | `/patient/search/{prefix}` | Trie autocomplete search |

### Queue APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/queue` | Get priority-sorted queue |
| `GET` | `/queue/next` | Peek at highest priority |
| `POST` | `/queue/process` | Extract max from heap |
| `PUT` | `/queue/age` | Trigger priority aging pass |

### Scheduler APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/schedule/run` | Run greedy scheduling |
| `GET` | `/schedule` | Get full schedule (AVL in-order) |
| `GET` | `/schedule/stats` | Get scheduling metrics |

### Simulation APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/simulation/start` | Start Poisson simulation |
| `POST` | `/simulation/stop` | Stop simulation |
| `GET` | `/simulation/status` | Get simulation status |
| `POST` | `/simulation/starvation` | Start starvation scenario |

### Comparison APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/compare` | Run A vs B comparison |
| `GET` | `/compare/result` | Get last comparison |

### Utility APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/logs` | Activity log (last 200) |
| `POST` | `/reset` | Reset all state |
| `GET` | `/health` | Health check |

---

## 📸 Pages & Screenshots

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Hero section, features grid, data structures showcase, triage system explainer |
| **Login** | `/login` | Staff authentication with HIPAA compliance notice |
| **Dashboard** | `/dashboard` | Real-time queue table + activity log + process next |
| **Register** | `/register` | Patient admission form + live priority score card |
| **Scheduler** | `/scheduler` | Treatment sequence table + algorithm insights |
| **Simulation** | `/simulation` | Arrival velocity chart + flow parameters |
| **Comparison** | `/comparison` | Strategy A vs B with performance delta table |
| **Lookup** | `/lookup` | ID search + name autocomplete |

---

## 🧮 Algorithm Details

### Priority Score Computation
```
priority_score = urgency_base + age_bonus + wait_time_bonus

Where:
  urgency_base = { Critical: 100, High: 75, Medium: 50, Low: 25 }
  age_bonus    = 10 (if age > 60, else 0)
  wait_bonus   = floor(wait_minutes / 10) × 5
```

### Greedy Scheduling
1. Extract all patients from the Max Heap (sorted by priority)
2. Assign 15-minute slots sequentially starting from time 0
3. Insert each appointment into the AVL Tree (keyed by start time)
4. Compute fairness metrics: max wait, Jain's Fairness Index, starvation count

### Jain's Fairness Index
```
J(x₁, x₂, ..., xₙ) = (Σxᵢ)² / (n × Σxᵢ²)

Where xᵢ = normalized wait time for patient i
Range: 1/n (worst) to 1.0 (perfect fairness)
```

### Starvation Detection
A patient is flagged as **starving** if:
- Urgency is `Low` or `Medium`
- Wait time exceeds **30 minutes**

### Aging Mechanism
- Every aging pass adds **+5** to all patients' priority scores
- Prevents low-urgency patients from waiting indefinitely
- Can be triggered manually or auto-triggered during simulation

---

## 👥 Contributors

| Name | Role |
|------|------|
| **Prathamesh Patil** | Full Stack Development |

---

## 📄 License

This project is built for academic purposes as part of the **DSAA (Data Structures and Algorithm Analysis)** course at SY IoT, Semester 4.

---

<p align="center">
  <strong>Built with ❤️ using custom data structures</strong><br/>
  <em>Max Heap · AVL Tree · Hash Table · Trie</em>
</p>
