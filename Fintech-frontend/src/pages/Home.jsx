import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ArrowUpRight, ArrowRight, ArrowDownRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  // Retrieve stored user profile from localStorage if available
  const storedUserRaw = localStorage.getItem('user_profile');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

  const [overviewData, setOverviewData] = useState({
    user: storedUser || { first_name: 'User', email: 'user@finfocus.com' },
    score: { percentage_score: 72, max_score: 100, status: 'GOOD SCORE' },
    metrics: {
      revenue_volatility: '4.2%',
      expense_ratio: '35%',
      avg_payment_delay: '12 Days'
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get('http://localhost:8000/api/analytics/overview/', { headers });
        if (response.data) {
          setOverviewData(response.data);
        }
      } catch (err) {
        console.warn("Using overview dynamic fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    navigate('/login');
  };

  const userObj = storedUser || overviewData?.user || { first_name: 'User', email: 'user@finfocus.com' };
  const userName = userObj.first_name || 'User';
  const scoreVal = overviewData?.score?.percentage_score || 72;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* Navigation Sidebar with user object */}
      <Sidebar user={userObj} />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <Header user={userObj} />

        <div className="p-6 md:p-10 flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* Welcome Header Banner */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {userName}!</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1">Your Business Overview & Financial Parameters</p>
            </div>
          </div>

          {/* Top 2 Cards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl">
            
            {/* LEFT COLUMN: Credit Score & Metric Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Credit Score Gauge Card */}
              <div 
                onClick={() => navigate('/dashboard/score')}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#26e6b6]/60 transition"
              >
                <h2 className="text-sm font-bold text-slate-700 self-start mb-2">Credit Score</h2>
                
                <div className="relative w-64 h-32 flex items-end justify-center my-2">
                  <svg className="w-64 h-32 overflow-visible" viewBox="0 0 200 100">
                    <defs>
                      <linearGradient id="homeScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Track Arc */}
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
                    
                    {/* Active Gradient Arc */}
                    <path 
                      d="M 20 100 A 80 80 0 0 1 180 100" 
                      fill="none" 
                      stroke="url(#homeScoreGrad)" 
                      strokeWidth="16" 
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - (scoreVal / 100))}
                    />

                    {/* Fixed Needle angle formula to rotate above 180 degrees */}
                    <g transform={`rotate(${-180 + (scoreVal / 100) * 180}, 100, 100)`}>
                      <line x1="100" y1="100" x2="160" y2="100" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="5" fill="#0f172a" />
                    </g>
                  </svg>

                {/* Score Number Display */}
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{scoreVal}</span>
                  <span className="text-xs text-slate-400 font-semibold">100</span>
                  <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase mt-1">
                    {overviewData?.score?.status || 'GOOD SCORE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom 3 Summary Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* Revenue Volatility */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-md">
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">Revenue Volatility</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-slate-900">
                    {overviewData?.metrics?.revenue_volatility || '4.2%'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              {/* Expense Ratio */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-md">
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">Expense Ratio</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-slate-900">
                    {overviewData?.metrics?.expense_ratio || '35%'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Avg Payment Delay */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-md">
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">Avg Payment Delay</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-slate-900">
                    {overviewData?.metrics?.avg_payment_delay || '12 Days'}
                  </span>
                  <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Cash Flow Forecast Widget (7 cols) */}
          <div className="lg:col-span-7">
            <div 
              onClick={() => navigate('/dashboard/forecast')}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl flex flex-col justify-between h-full cursor-pointer hover:border-[#26e6b6]/60 transition relative overflow-hidden"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900">Cash Flow Forecast</h2>
                <p className="text-xs text-slate-400">Click to expand detailed 90-day time-series trajectory.</p>
              </div>

              {/* SVG Mini Chart */}
              <div className="relative h-64 w-full my-4">
                
                {/* Y-Axis scale */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-semibold">
                  <div className="border-b border-dashed border-slate-200 pb-0.5">$5,000</div>
                  <div className="border-b border-dashed border-slate-200 pb-0.5">+10,000</div>
                  <div className="border-b border-dashed border-slate-200 pb-0.5">+5,000</div>
                  <div className="border-b border-slate-300 pb-0.5">0</div>
                  <div className="border-b border-dashed border-slate-200 pb-0.5">-15,000</div>
                  <div className="border-b border-dashed border-slate-200 pb-0.5">-10,000</div>
                </div>

                <svg className="w-full h-full absolute inset-0 pl-12 pr-2 overflow-visible" viewBox="0 0 600 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="homeChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#26e6b6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#26e6b6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Vertical Dotted Guide */}
                  <line x1="420" y1="10" x2="420" y2="220" stroke="#cbd5e1" strokeDasharray="3 3" />

                  {/* Shaded Region */}
                  <polygon 
                    points="20,150 60,110 120,110 180,60 240,140 300,180 360,140 420,110 600,60 600,150 20,150" 
                    fill="url(#homeChartGrad)" 
                  />

                  {/* Solid Teal Curve Line */}
                  <path 
                    d="M 20 150 L 60 110 L 120 110 L 180 60 L 240 140 L 300 180 L 360 140 L 420 110 L 600 60" 
                    fill="none" 
                    stroke="#1fc49a" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  {/* Circle Markers */}
                  <circle cx="180" cy="60" r="5" fill="#1fc49a" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="300" cy="180" r="5" fill="#1fc49a" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* Tooltip Badge 1 */}
                <div className="absolute top-[16%] left-[22%] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-xl shadow-md text-xs font-bold text-slate-800">
                  May 1: <span className="text-emerald-600">+$15,000</span>
                </div>

                {/* Tooltip Badge 2 */}
                <div className="absolute top-[68%] left-[60%] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-xl shadow-md text-xs font-bold text-slate-800">
                  Jun 1 (Projected): <span className="text-rose-500">-$3,000</span>
                </div>

              </div>

              {/* X-Axis Timeline Markers */}
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold pl-12 pr-2 pt-2 border-t border-slate-100">
                <span>May 1</span>
                <span>13 AM</span>
                <span>May 1</span>
                <span>12 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>10 PM</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
    </div>
  );
}

export default Home;
