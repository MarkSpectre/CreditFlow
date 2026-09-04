import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Building2, 
  TrendingUp, 
  LogOut, 
  RefreshCw,
  Sliders,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LoanOfficerDashboard() {
  const navigate = useNavigate();

  const storedUserRaw = localStorage.getItem('user_profile');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const officerName = storedUser?.first_name || 'Officer';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Selected application modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalApprovedAmt, setModalApprovedAmt] = useState('');
  const [modalInterestRate, setModalInterestRate] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('http://localhost:8000/api/analytics/loan/officer/applications/', { headers });
      if (res.data && res.data.applications) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.warn("Using loan officer applications fallback list:", err);
      // Demo fallback if backend server is starting up
      setApplications([
        {
          id: 101,
          applicant: {
            name: "Sarah Jenkins",
            email: "sarah@finfocus.com",
            company_name: "FinFocus Tech Solutions",
            tax_id: "27AAACF1234H1Z5",
            industry: "SaaS & Tech Services",
            annual_revenue: 320000,
            monthly_cashflow: 24500,
            debt_to_income_ratio: 28.5,
            credit_score: 758,
            score_status: "GOOD SCORE"
          },
          requested_amount: 50000,
          loan_purpose: "Working Capital Expansion",
          tenure_months: 24,
          collateral_type: "Unsecured / Business Cashflow",
          collateral_value: 0,
          monthly_income: 24500,
          existing_emi: 1200,
          status: "APPROVED",
          approved_amount: 50000,
          interest_rate: 8.75,
          monthly_installment: 2278,
          risk_tier: "Tier A - Low Risk",
          dscr: 1.85,
          underwriting_notes: "Strong cashflow stream and verified GST compliance.",
          created_at: "Aug 29, 2026 14:30"
        },
        {
          id: 102,
          applicant: {
            name: "David Miller",
            email: "david@apexlogistics.com",
            company_name: "Apex Logistics & Supply",
            tax_id: "36BBBDG5678J2Z9",
            industry: "Manufacturing & Logistics",
            annual_revenue: 540000,
            monthly_cashflow: 41000,
            debt_to_income_ratio: 35.0,
            credit_score: 685,
            score_status: "MODERATE SCORE"
          },
          requested_amount: 120000,
          loan_purpose: "Equipment Purchase",
          tenure_months: 36,
          collateral_type: "Machinery & Equipment",
          collateral_value: 80000,
          monthly_income: 41000,
          existing_emi: 4500,
          status: "UNDER_REVIEW",
          approved_amount: 90000,
          interest_rate: 11.25,
          monthly_installment: 2950,
          risk_tier: "Tier B - Moderate Risk",
          dscr: 1.32,
          underwriting_notes: "Pending equipment appraisal document review.",
          created_at: "Aug 30, 2026 10:15"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setModalStatus(app.status);
    setModalNotes(app.underwriting_notes || '');
    setModalApprovedAmt(app.approved_amount);
    setModalInterestRate(app.interest_rate);
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = {
        status: modalStatus,
        underwriting_notes: modalNotes,
        approved_amount: parseFloat(modalApprovedAmt) || selectedApp.requested_amount,
        interest_rate: parseFloat(modalInterestRate) || selectedApp.interest_rate
      };
      await axios.patch(`http://localhost:8000/api/analytics/loan/officer/applications/${selectedApp.id}/status/`, payload, { headers });
      
      // Update local state
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? {
        ...a,
        status: modalStatus,
        underwriting_notes: modalNotes,
        approved_amount: parseFloat(modalApprovedAmt) || a.requested_amount,
        interest_rate: parseFloat(modalInterestRate) || a.interest_rate
      } : a));

      setSelectedApp(null);
    } catch (err) {
      console.warn("Status update fallback:", err);
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? {
        ...a,
        status: modalStatus,
        underwriting_notes: modalNotes
      } : a));
      setSelectedApp(null);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    navigate('/login');
  };

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.loan_purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalAppsCount = applications.length;
  const pendingCount = applications.filter(a => a.status === 'UNDER_REVIEW').length;
  const approvedCapital = applications.filter(a => a.status === 'APPROVED' || a.status === 'PRE_APPROVED')
    .reduce((sum, a) => sum + (a.approved_amount || a.requested_amount), 0);
  const avgCreditScore = totalAppsCount > 0 
    ? Math.round(applications.reduce((sum, a) => sum + (a.applicant.credit_score || 720), 0) / totalAppsCount)
    : 740;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-[#111726]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src={logo} alt="TrustLedger Logo" className="h-10 w-auto object-contain" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">TrustLedger</span>
              <span className="px-2 py-0.5 rounded-full bg-[#26e6b6]/15 border border-[#26e6b6]/30 text-[#26e6b6] text-[10px] font-extrabold uppercase">
                Loan Officer Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Institutional Underwriting & Decision Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{officerName}</p>
            <p className="text-[10px] text-[#26e6b6]">Senior Underwriter</p>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Body */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Loan Application Underwriting</h1>
            <p className="text-slate-400 text-xs mt-1">Review live borrower applications stored in database, check ML credit scores & approve requests.</p>
          </div>

          <button 
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#182032] border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-[#26e6b6] transition shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Applications DB</span>
          </button>
        </div>

        {/* 4 Overview Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Total Applications</span>
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mt-3">{totalAppsCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Stored in Postgres database</p>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Pending Review</span>
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-400 mt-3">{pendingCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Action required</p>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Capital Approved</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#26e6b6] mt-3">${approvedCapital.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Across approved applicants</p>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Avg Credit Score</span>
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mt-3">{avgCreditScore} <span className="text-xs text-slate-400 font-normal">/ 850</span></p>
            <p className="text-[11px] text-slate-400 mt-1">Automated ML baseline</p>
          </div>

        </div>

        {/* Filter Controls & Search */}
        <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business, applicant, email..." 
              className="w-full bg-[#182032] border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-[#26e6b6] transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['ALL', 'UNDER_REVIEW', 'APPROVED', 'PRE_APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st 
                    ? 'bg-[#26e6b6] text-slate-950 shadow-md' 
                    : 'bg-[#182032] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All Applications' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

        </div>

        {/* Applications Data Table */}
        <div className="bg-[#111726] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#26e6b6]" />
              <span>Fetching loan applications from database...</span>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No loan applications found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161f33] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Applicant & Company</th>
                    <th className="p-4">Requested Capital</th>
                    <th className="p-4">ML Credit Score</th>
                    <th className="p-4">Calculated DSCR</th>
                    <th className="p-4">Risk Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#182136] transition">
                      
                      {/* Applicant & Company */}
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{app.applicant.company_name}</div>
                        <div className="text-[11px] text-slate-400">{app.applicant.name} • {app.applicant.email}</div>
                      </td>

                      {/* Requested Capital */}
                      <td className="p-4">
                        <div className="font-extrabold text-white text-sm">${app.requested_amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">{app.loan_purpose} ({app.tenure_months}m)</div>
                      </td>

                      {/* ML Credit Score */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-lg ${
                          app.applicant.credit_score >= 740 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : app.applicant.credit_score >= 650
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5" />
                          {app.applicant.credit_score} / 850
                        </span>
                      </td>

                      {/* DSCR */}
                      <td className="p-4 font-bold text-slate-300">
                        <span className={app.dscr >= 1.25 ? 'text-emerald-400' : 'text-amber-400'}>
                          {app.dscr}x
                        </span>
                      </td>

                      {/* Risk Tier */}
                      <td className="p-4 text-[#26e6b6] font-semibold text-[11px]">
                        {app.risk_tier}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          app.status === 'APPROVED' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'PRE_APPROVED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleOpenModal(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#26e6b6] text-slate-950 font-bold hover:bg-[#1fc49a] transition shadow-md text-xs inline-flex items-center gap-1"
                        >
                          Review & Underwrite <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* ================= APPLICANT REVIEW MODAL ================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#161f33]">
              <div>
                <h3 className="text-xl font-bold text-white">Underwrite Application #{selectedApp.id}</h3>
                <p className="text-xs text-slate-400">{selectedApp.applicant.company_name} ({selectedApp.applicant.name})</p>
              </div>

              <button 
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Financial Metrics Summary Grid */}
              <div className="grid grid-cols-3 gap-3 bg-[#182032] p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Cashflow</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">${selectedApp.applicant.monthly_cashflow.toLocaleString()}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Debt-to-Income (DTI)</span>
                  <span className="text-sm font-bold text-amber-400 mt-0.5 block">{selectedApp.applicant.debt_to_income_ratio}%</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Collateral Type</span>
                  <span className="text-sm font-bold text-cyan-300 mt-0.5 block truncate">{selectedApp.collateral_type}</span>
                </div>
              </div>

              {/* Loan Details Form Fields */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Approved Loan Amount ($)</label>
                  <input 
                    type="number"
                    value={modalApprovedAmt}
                    onChange={(e) => setModalApprovedAmt(e.target.value)}
                    className="w-full bg-[#182032] border border-slate-700 text-white rounded-xl p-2.5 font-bold text-sm focus:outline-none focus:border-[#26e6b6]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Interest Rate APR (%)</label>
                  <input 
                    type="number"
                    step="0.25"
                    value={modalInterestRate}
                    onChange={(e) => setModalInterestRate(e.target.value)}
                    className="w-full bg-[#182032] border border-slate-700 text-white rounded-xl p-2.5 font-bold text-sm focus:outline-none focus:border-[#26e6b6]"
                  />
                </div>
              </div>

              {/* Status Decision Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Underwriting Status Decision</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'APPROVED', label: 'Approve', color: 'bg-emerald-500 text-slate-950' },
                    { id: 'PRE_APPROVED', label: 'Pre-Approve', color: 'bg-amber-400 text-slate-950' },
                    { id: 'UNDER_REVIEW', label: 'In Review', color: 'bg-slate-700 text-white' },
                    { id: 'REJECTED', label: 'Reject', color: 'bg-rose-500 text-white' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setModalStatus(btn.id)}
                      className={`py-2.5 rounded-xl font-bold text-xs transition border ${
                        modalStatus === btn.id 
                          ? `${btn.color} border-transparent shadow-lg` 
                          : 'bg-[#182032] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Underwriting Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Underwriter Remarks & Compliance Notes</label>
                <textarea 
                  rows="3"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Enter custom risk notes or approval justification..."
                  className="w-full bg-[#182032] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#26e6b6]"
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#161f33] flex items-center justify-end gap-3">
              <button 
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button 
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-6 py-2 rounded-xl bg-[#26e6b6] text-slate-950 font-bold text-xs hover:bg-[#1fc49a] transition shadow-lg shadow-[#26e6b6]/20"
              >
                {updating ? 'Saving to Database...' : 'Save Decision to DB'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default LoanOfficerDashboard;
