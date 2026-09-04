import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  X
} from 'lucide-react';

function Transactions() {
  const [data, setData] = useState({
    summary: {
      account_balance: 144000,
      monthly_inflow: 22250,
      monthly_outflow: 13420,
      net_cashflow: 8830,
      pending_count: 1
    },
    transactions: [
      {
        id: "TXN-882101",
        date: "2026-08-24",
        merchant: "AWS Cloud Services",
        category: "Infrastructure",
        type: "debit",
        amount: 1450.00,
        status: "Completed",
        payment_method: "Corporate Credit Card (•••• 4092)",
        reference: "INV-2026-081"
      },
      {
        id: "TXN-882102",
        date: "2026-08-23",
        merchant: "Stripe Merchant Payout",
        category: "Client Revenue",
        type: "credit",
        amount: 12800.00,
        status: "Completed",
        payment_method: "ACH Direct Deposit",
        reference: "SETTLE-88192"
      },
      {
        id: "TXN-882103",
        date: "2026-08-21",
        merchant: "Salesforce SaaS Subscription",
        category: "Software",
        type: "debit",
        amount: 850.00,
        status: "Completed",
        payment_method: "Auto-Debit Checking",
        reference: "SUB-99412"
      },
      {
        id: "TXN-882104",
        date: "2026-08-20",
        merchant: "Apex Enterprise Invoicing",
        category: "Client Revenue",
        type: "credit",
        amount: 9450.00,
        status: "Completed",
        payment_method: "Wire Transfer",
        reference: "INV-99014"
      },
      {
        id: "TXN-882105",
        date: "2026-08-18",
        merchant: "WeWork Office Lease",
        category: "Operations",
        type: "debit",
        amount: 3200.00,
        status: "Completed",
        payment_method: "ACH Direct Deposit",
        reference: "LEASE-AUG26"
      },
      {
        id: "TXN-882106",
        date: "2026-08-15",
        merchant: "Google Workspace & Ads",
        category: "Marketing",
        type: "debit",
        amount: 1120.00,
        status: "Pending",
        payment_method: "Corporate Credit Card (•••• 4092)",
        reference: "ADS-77291"
      },
      {
        id: "TXN-882107",
        date: "2026-08-12",
        merchant: "Global Logistics Supply",
        category: "Inventory",
        type: "debit",
        amount: 4500.00,
        status: "Completed",
        payment_method: "Wire Transfer",
        reference: "PO-10492"
      },
      {
        id: "TXN-882108",
        date: "2026-08-10",
        merchant: "KPMG Tax Compliance Retainer",
        category: "Professional Services",
        type: "debit",
        amount: 2100.00,
        status: "Flagged",
        payment_method: "ACH Direct Deposit",
        reference: "RET-2026-Q3"
      }
    ]
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, credit, debit
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, Completed, Pending, Flagged
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModalTxn, setActiveModalTxn] = useState(null);

  // Retrieve user profile
  const storedUserRaw = localStorage.getItem('user_profile');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const userObj = storedUser || { first_name: 'User', email: 'user@trustledger.com' };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('http://localhost:8000/api/analytics/transactions/', { headers });
        if (res.data && res.data.transactions) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Using offline transactions fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter Logic
  const filteredTransactions = data.transactions.filter(txn => {
    const matchesSearch = 
      txn.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || txn.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || txn.category === selectedCategory;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Extract Categories
  const categories = ['all', ...Array.from(new Set(data.transactions.map(t => t.category)))];

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Date", "Merchant", "Category", "Type", "Amount", "Status", "Payment Method", "Reference"];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      `"${t.merchant}"`,
      `"${t.category}"`,
      t.type,
      t.amount,
      t.status,
      `"${t.payment_method}"`,
      t.reference
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TrustLedger_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar user={userObj} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <Header user={userObj} />

        {/* Dashboard Body Canvas */}
        <div className="p-6 md:p-10 flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <ArrowLeftRight className="w-8 h-8 text-[#26e6b6]" /> Financial Transactions
                </h1>
                <p className="text-xs text-slate-500 mt-1">Real-time ledger audit trail parsed from bank accounts & connected accounting streams.</p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-lg flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4 text-[#26e6b6]" /> Export Statement (CSV)
              </button>
            </div>

            {/* Summary Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Account Balance */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-md">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Available Liquidity</span>
                  <DollarSign className="w-4 h-4 text-[#26e6b6]" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 mt-2">
                  ${data.summary.account_balance.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live Bank Stream</span>
              </div>

              {/* Monthly Inflow */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-md">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Monthly Inflow</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-extrabold text-emerald-600 mt-2">
                  +${data.summary.monthly_inflow.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">2 Credit Deposits</span>
              </div>

              {/* Monthly Outflow */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-md">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Monthly Outflow</span>
                  <ArrowDownRight className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl font-extrabold text-rose-600 mt-2">
                  -${data.summary.monthly_outflow.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">6 Operating Expenses</span>
              </div>

              {/* Net Cashflow */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-md">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Net Monthly Cashflow</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className={`text-2xl font-extrabold mt-2 ${data.summary.net_cashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.summary.net_cashflow >= 0 ? '+' : ''}${data.summary.net_cashflow.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                  {data.summary.pending_count} Pending Authorization
                </span>
              </div>

            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Search Box (5 cols) */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by merchant, ID, or reference..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                  />
                </div>

                {/* Category Dropdown (3 cols) */}
                <div className="md:col-span-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        Category: {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Dropdown (2 cols) */}
                <div className="md:col-span-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                  >
                    <option value="all">Status: All</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Flagged">Flagged</option>
                  </select>
                </div>

                {/* Type Toggle Pills (2 cols) */}
                <div className="md:col-span-2 flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['all', 'credit', 'debit'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition capitalize ${
                        selectedType === type
                          ? 'bg-[#26e6b6] text-slate-950 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Ledger Records ({filteredTransactions.length})</h2>
                <span className="text-xs text-slate-400">Click any transaction line to inspect audit details</span>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No matching transactions found. Try resetting your search filters!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5 rounded-l-xl">ID & Date</th>
                        <th className="p-3.5">Merchant / Source</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Payment Method</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right rounded-r-xl">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                      {filteredTransactions.map((txn) => (
                        <tr 
                          key={txn.id} 
                          onClick={() => setActiveModalTxn(txn)}
                          className="hover:bg-slate-50/90 transition cursor-pointer group"
                        >
                          <td className="p-3.5">
                            <span className="font-mono text-slate-900 font-bold block">{txn.id}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{txn.date}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 group-hover:text-[#10b981] transition">{txn.merchant}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">{txn.reference}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                              {txn.category}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 text-[11px]">
                            {txn.payment_method}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${
                              txn.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : txn.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {txn.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {txn.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                              {txn.status === 'Flagged' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                              {txn.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-bold text-sm">
                            <span className={txn.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}>
                              {txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Transaction Details Modal */}
      {activeModalTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction Audit Breakdown</span>
                <h3 className="text-lg font-bold text-slate-900">{activeModalTxn.id}</h3>
              </div>
              <button 
                onClick={() => setActiveModalTxn(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">Amount</span>
                <span className={`text-xl font-extrabold ${activeModalTxn.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {activeModalTxn.type === 'credit' ? '+' : '-'}${activeModalTxn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Merchant / Counterparty</span>
                <span className="font-bold text-slate-800">{activeModalTxn.merchant}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Category</span>
                <span className="font-bold text-slate-800">{activeModalTxn.category}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Date & Time</span>
                <span className="font-bold text-slate-800">{activeModalTxn.date} • 14:22:10 UTC</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Payment Channel</span>
                <span className="font-bold text-slate-800">{activeModalTxn.payment_method}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Reference ID</span>
                <span className="font-mono font-bold text-slate-800">{activeModalTxn.reference}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => alert(`GST Receipt Invoice generated for ${activeModalTxn.id}`)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-emerald-600" /> View GST Invoice
              </button>
              
              <button
                onClick={() => setActiveModalTxn(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#26e6b6] text-slate-950 text-xs font-extrabold hover:bg-[#1fc49a] transition shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
