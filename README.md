# Policy Approval Agent

## 🚀 Autonomous Policy Approval & Compliance Agent

Policy Approval Agent is an AI-powered compliance and policy evaluation system that automatically analyzes expense claims against predefined business rules and generates deterministic approval decisions.

The system helps organizations reduce manual approval work by evaluating claims consistently and providing transparent explanations for every decision.

---

## ✨ Features

* 🤖 **Automated Claim Evaluation** — Automatically evaluates expense claims against configured policies.
* 📋 **Natural Language Policy Rules** — Define approval rules using simple English.
* ⚡ **Deterministic Rule Engine** — Applies rules consistently and predictably.
* ✅ **Automatic Approvals** — Claims that satisfy all required policies are approved.
* ❌ **Automatic Rejections** — Claims that violate rejection rules are rejected.
* ⚠️ **Escalation Support** — Complex or uncertain claims can be escalated for manual review.
* 🔍 **Evaluation Trace** — Shows how each rule was evaluated and why a decision was made.
* 📊 **Claims Matrix** — Provides a structured view of claims and their decisions.
* 📈 **Analytics & Audit** — Displays approval statistics and decision information.
* 🎨 **Rule Studio** — Create and manage policy rules through the interface.
* 🔗 **FastAPI Backend** — Provides APIs for claim processing and policy evaluation.

---

## 🏗️ Project Architecture

```text
Policy Approval Agent
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── backend/
│   ├── main.py
│   ├── rule_engine.py
│   ├── requirements.txt
│   └── data/
│       ├── claims.json
│       └── clamis.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3

### Backend

* Python
* FastAPI
* Rule-based evaluation engine

### Data

* JSON

### Development Tools

* Git
* GitHub
* VS Code

---

## 🔄 How It Works

```text
User submits an expense claim
            ↓
Claim data is received by backend
            ↓
Policy rules are loaded
            ↓
Rule Engine evaluates the claim
            ↓
Each condition is checked
            ↓
Decision is generated
            ↓
┌────────────┬─────────────┐
│   APPROVED │  REJECTED   │
│            │             │
└────────────┴─────────────┘
            ↓
       ESCALATED
     when manual review
        is required
```

---

## 📌 Example Policy Rules

The system can evaluate rules such as:

* Claims below a specified amount can be automatically approved.
* Claims above a specified amount require manager approval.
* Hotel expenses must remain within the permitted limit.
* Travel expenses must comply with company policy.
* Missing or invalid information can trigger escalation.

---

## 📊 Dashboard

The application provides an interactive dashboard containing:

* Total Claims
* Approved Claims
* Rejected Claims
* Escalated Claims
* Approval Rate
* Approved Volume
* Rule Studio
* Claims Matrix
* Analytics & Audit

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/swathikamana604/Project-Policay-Approval-Agent.git
```

### 2. Open the project

```bash
cd Project-Policay-Approval-Agent
```

### 3. Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will normally run at:

```text
http://127.0.0.1:8000
```

---

## 💻 Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the URL shown by Vite in your browser.

---

## 🎯 Project Objectives

The main objectives of this project are:

1. Automate expense claim approval.
2. Reduce manual policy verification.
3. Provide transparent and explainable decisions.
4. Apply business rules consistently.
5. Support approval, rejection, and escalation workflows.
6. Provide analytics for monitoring compliance.

---

## 🔮 Future Enhancements

* Integration with Large Language Models (LLMs)
* AI-powered policy generation
* Natural-language claim analysis
* Authentication and role-based access
* Database integration
* Email notifications
* Advanced audit logs
* Cloud deployment
* Machine-learning based anomaly detection
* Integration with enterprise expense management systems

---

## 👩‍💻 Project

**Policy Approval Agent**

An autonomous compliance and policy evaluation application designed to make business expense approval faster, more consistent, and transparent.

---

## 📄 License

This project is developed for educational, internship, and demonstration purposes.
"# Projects" 
