# 🏦 CreditFlow - AI-Powered SME Credit Assessment & Cash Flow Intelligence Platform

CreditFlow is an enterprise-grade fintech web application designed for **Small & Medium Enterprises (SMEs)** and **Bank Loan Officers**. It leverages Machine Learning models to provide real-time cash flow forecasting, explainable credit scoring using SHAP marginal values, automated loan underwriting, and a live financial transaction ledger.

---

## 🌟 Key Features

### 💼 Business Owner Portal
- **Dynamic ML Credit Scoring & SHAP Explainer**:
  - Calculates multi-factor credit scores (300–850 scale and 0–100 percentage rating).
  - Breaks down exact SHAP marginal impacts (Payment History, GST Compliance, Credit Age, Debt-to-Income, Volatility, Inquiries).
- **Time-Series Cash Flow Forecasting**:
  - Predictive ML engine (Scikit-Learn Ridge Regressor) forecasting 30, 60, and 90-day cash positions.
  - Interactive confidence bounds (upper/lower bounds) and automated liquidity shortage alerts.
- **Financial Transactions Ledger**:
  - Full audit trail of business income (credits) and expenses (debits).
  - Search, category filter, status toggle, and CSV export.
  - **"+ Add Transaction" Feature**: Add new transactions on the fly to dynamically update financial metrics and recalculate credit scores in real time.
- **Automated Onboarding & Bank Statement Parsing**:
  - GSTIN / Tax Identification checksum verification.
  - Financial statement document parsing and turnover calculation.
- **Loan Applications**:
  - Submit working capital loan requests with instant automated ML underwriting feedback.

### 🛡️ Loan Officer Portal
- **Loan Application Review Dashboard**:
  - View all submitted loan applications from business applicants.
  - Inspect calculated applicant credit scores, risk tiers, and **Debt Service Coverage Ratios (DSCR)**.
- **Underwriting Management**:
  - Approve, pre-approve with adjusted limits/interest rates, or reject applications with custom underwriter notes.

---

## 🛠️ Technology Stack

| Domain | Technology / Framework |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6, `@react-oauth/google` |
| **Backend** | Python 3.11+, Django 5.x, Django REST Framework (DRF), SimpleJWT |
| **Machine Learning** | Scikit-Learn (Ridge Regression, Polynomial Features), NumPy |
| **Database** | SQLite (Default Local) / Supabase PostgreSQL |

---

## 📁 Repository Structure

```text
Fintech-Website/
├── Fintech-backend/         # Django REST Framework Backend
│   ├── analytics/           # Credit scoring, forecasting, transactions, & loan APIs
│   ├── authentication/      # JWT authentication, user profiles, & Google OAuth endpoints
│   ├── core/                # Django project configuration & settings
│   ├── manage.py            # Django management script
│   └── venv/                # Python virtual environment
│
├── Fintech-frontend/        # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/      # Sidebar, Header, UI widgets
│   │   ├── pages/           # Dashboard, Transactions, Score, Forecast, Loan, Login, Onboarding
│   │   ├── App.jsx          # Main routing table
│   │   └── main.jsx         # React DOM entrypoint & OAuth provider
│   ├── package.json         # Node dependencies & scripts
│   └── vite.config.js       # Vite configuration
│
└── README.md                # Root project documentation (this file)
```

---

## 🚀 Step-by-Step Setup & Run Instructions

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0 or higher) & **npm**
- **Python** (v3.11 or higher) & **pip**

---

### 1️⃣ Setting Up & Running the Backend (Django)

1. Open your terminal and navigate to the `Fintech-backend` directory:
   ```bash
   cd "Fintech-backend"
   ```

2. Activate the virtual environment (if not already activated):
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

3. Install required Python packages (if running in a new environment):
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers scikit-learn numpy requests google-auth
   ```

4. Apply database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Start the Django backend server:
   ```bash
   python manage.py runserver
   ```
   The backend API will be live at: `http://localhost:8000/`

---

### 2️⃣ Setting Up & Running the Frontend (React + Vite)

1. Open a new terminal window and navigate to the `Fintech-frontend` directory:
   ```bash
   cd "Fintech-frontend"
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Configure Google OAuth Client ID:
   Create a `.env` file in `Fintech-frontend/`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend web app will be live at: `http://localhost:5173/`

---

## 🔑 Access Portals & Credentials

When logging in from the landing page (`http://localhost:5173/login`), you can choose either portal role:

1. **Business Owner Portal**:
   - Use standard login or click **⚡ Quick Demo Sign In (Business Owner)**.
   - Accesses dashboard, cash flow forecast, credit score breakdown, transactions ledger, and loan applications.

2. **Loan Officer Portal**:
   - Switch role tab to **Loan Officer** and click **⚡ Quick Demo Sign In (Loan Officer)**.
   - Accesses officer underwriting dashboard to review, approve, or adjust applicant loan applications.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Standard email/password authentication & JWT session token generation |
| `POST` | `/api/auth/google/` | Google OAuth ID token verification & profile mapping |
| `GET` | `/api/analytics/overview/` | Financial overview metrics, credit score, & cash flow forecast summary |
| `GET` | `/api/analytics/score/` | Detailed credit score breakdown & SHAP feature drivers |
| `GET` | `/api/analytics/forecast/` | Time-series cash flow forecasting (30, 60, 90-day timeframes) |
| `GET` | `/api/analytics/transactions/` | Fetch transaction history, net cashflow, & account balances |
| `POST` | `/api/analytics/transactions/` | Post new transaction & trigger dynamic credit score recalculation |
| `GET` | `/api/analytics/officer/applications/` | Fetch all loan applications for Loan Officer review |
| `PATCH` | `/api/analytics/officer/applications/<id>/` | Update loan application status, approved amount, & notes |

---

## 📜 License
This project is created for demonstration and educational purposes.
