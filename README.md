# Credit Risk Assessment & Underwriting AI Engine

An end-to-end Machine Learning and FinTech Underwriting System designed to predict borrower loan default risk, assess creditworthiness, and provide explainable risk decisions.

## 🌟 Highlights

- **Predictive ML Pipeline**: Trained on 32,500+ loan applications with Scikit-learn and **XGBoost Classifier**.
- **High-Performance Evaluation**:
  - **Accuracy**: 92.51%
  - **ROC-AUC**: 0.9424
  - **Bad Risk Precision**: 94.06%
  - **Bad Risk Recall**: 70.11%
- **Explainable AI (XAI)**: Feature contributions highlighting primary credit drivers (Loan-to-income ratio, rental status, APR, bureau history).
- **Interactive FinTech Frontend Console**:
  - Live radial score gauge displaying **Credit Score (300 - 850)**, **Default Probability**, and **Grade (A+ to D)**.
  - One-click applicant scenario presets (**Prime**, **Young Professional**, **Venture**, **High Risk**).
  - Dynamic **Sensitivity & What-If Sandbox** with real-time sliders.
  - Interactive **2x2 Confusion Matrix** and **Decision Cutoff Boundary Tuning**.
  - Audit trail with **CSV Export** and detailed inspection drawer.

---

## 🏗️ Project Architecture

```
Credit Risk Assessment/
├── backend/
│   ├── api.py            # Flask REST API (/predict, /metrics, /features, /)
│   └── schemas.py        # Schema validation & type checking
├── frontend/             # React 18 + Vite FinTech UI
│   ├── src/
│   │   ├── api/          # Resilient API client with fallback simulation
│   │   ├── components/   # TopNav, ScoreForm, ScoreRing, History, DetailSheet,
│   │   │                 # MonitoringPanel, DriftPanel, SimulatorPanel
│   │   ├── App.jsx       # Main application layout & session state
│   │   └── index.css     # Obsidian fintech design system
├── models/
│   └── best_credit_risk_model.pkl # Trained XGBoost preprocessing + model pipeline
├── src/
│   ├── preprocess.py     # Imputation, scaling & one-hot pipeline
│   ├── train.py          # Model training, comparison & export
│   └── evaluate.py       # Metrics, confusion matrix & ROC curve
└── tests/
    └── test_api.py       # API integration tests
```

---

## 🚀 Running the Project

### Step 1: Start the Backend API
```bash
python backend/api.py
```
*The Flask ML Engine starts at `http://127.0.0.1:5000`.*

### Step 2: Start the Frontend Console
```bash
cd frontend
npm run dev
```
*Open `http://localhost:5173` in your browser.*
