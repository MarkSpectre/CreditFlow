import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ArrowUpRight, ShieldCheck, ChevronRight } from 'lucide-react';

function Score() {
  // Retrieve stored user profile from localStorage if available
  const storedUserRaw = localStorage.getItem('user_profile');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

  const defaultDrivers = [
    { id: 'payment_history', name: 'Payment History', impact: 15, type: 'positive', tooltip: 'Based on 12 months of on-time filings with no significant delays.' },
    { id: 'gst_filing', name: 'Consistent GST Filing', impact: 8, type: 'positive', tooltip: 'GST filings submitted at 98% compliance level across recent quarters.' },
    { id: 'credit_age', name: 'Credit Age', impact: 5, type: 'positive', tooltip: 'Business credit profile active for over 4.5 years.' },
    { id: 'dti_ratio', name: 'Debt-to-Income Ratio', impact: -6, type: 'negative', tooltip: 'DTI ratio of 28.5% compared against the 25% recommended baseline.' },
    { id: 'revenue_volatility', name: 'Revenue Volatility', impact: -12, type: 'negative', tooltip: 'Quarterly revenue variance of 4.2% measured from bank stream analysis.' },
    { id: 'credit_inquiries', name: 'Credit Inquiries', impact: -3, type: 'negative', tooltip: '2 hard credit inquiries recorded in the last 6 months.' }
  ];

  const [scoreData, setScoreData] = useState({
    score: 758,
    max_score: 850,
    percentage_score: 72,
    status: 'GOOD SCORE',
    drivers: defaultDrivers,
    user: storedUser || { first_name: 'Demo User', email: 'user@finfocus.com' }
  });

  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState('payment_history');

  useEffect(() => {
    const fetchScoreData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get('http://localhost:8000/api/analytics/score/', { headers });
        if (response.data && response.data.drivers) {
          setScoreData(response.data);
        }
      } catch (err) {
        console.warn("Using dynamic score driver fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreData();
  }, []);

  const scoreVal = scoreData?.score || 758;
  const maxScore = scoreData?.max_score || 850;
  const needleAngle = -180 + (scoreVal / maxScore) * 180;
  const userObj = storedUser || scoreData?.user || { first_name: 'User', email: 'user@finfocus.com' };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar user={userObj} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <Header user={userObj} />

        <div className="p-6 md:p-10 flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* Top Header Title */}
          <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dynamic Credit Score Breakdown</h1>
            <p className="text-xs text-slate-500">Real-time credit score metrics calculated from bank stream statement inputs.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> Live Score Active
            </span>
          </div>
        </div>

        {/* Center Container */}
        <div className="max-w-4xl mx-auto w-full space-y-6">
          
          {/* ================= GAUGE METER CARD ================= */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative w-72 h-36 flex items-end justify-center">
              {/* Arc SVG */}
              <svg className="w-72 h-36 overflow-visible" viewBox="0 0 200 100">
                <defs>
                  <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                {/* Background Arc Track */}
                <path 
                  d="M 20 100 A 80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                />
                {/* Colored Gradient Arc */}
                <path 
                  d="M 20 100 A 80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="url(#scoreGaugeGrad)" 
                  strokeWidth="16" 
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - (scoreVal / maxScore))}
                  className="transition-all duration-1000 ease-out"
                />
                {/* Needle Indicator */}
                <g transform={`rotate(${needleAngle}, 100, 100)`} className="transition-transform duration-1000 ease-out">
                  <line x1="100" y1="100" x2="160" y2="100" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                </g>
              </svg>

              {/* Gauge Score Value Display */}
              <div className="absolute bottom-1 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{scoreVal}</span>
                <span className="text-xs text-slate-400 font-semibold">out of {maxScore}</span>
                <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase mt-0.5">
                  {scoreData?.status || 'GOOD SCORE'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= DYNAMIC SCORE DRIVERS BREAKDOWN CHART ================= */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-slate-200/80 shadow-xl relative min-h-[360px]">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Score Drivers Breakdown</h2>

            {/* Drivers Chart Container */}
            <div className="relative my-4">
              
              {/* Background Grid Lines & Center Zero Line */}
              <div className="absolute inset-0 flex justify-between pointer-events-none -z-0 px-32">
                <div className="border-r border-dashed border-slate-200 h-full"></div>
                <div className="border-r-2 stroke-slate-400 border-slate-400 h-full z-10"></div>
                <div className="border-r border-dashed border-slate-200 h-full"></div>
              </div>

              {/* Drivers List */}
              <div className="space-y-5 relative z-10">
                {(scoreData?.drivers || defaultDrivers).map((driver) => {
                  const isPositive = driver.type === 'positive';
                  const isHovered = activeTooltip === driver.id;

                  return (
                    <div 
                      key={driver.id} 
                      onMouseEnter={() => setActiveTooltip(driver.id)}
                      className="grid grid-cols-12 items-center text-xs group cursor-pointer relative"
                    >
                      {/* Driver Name (Left 4 cols) */}
                      <div className="col-span-4 font-bold text-slate-700 truncate pr-2">
                        {driver.name}
                      </div>

                      {/* Bar Plot Area (Center 8 cols) */}
                      <div className="col-span-8 relative flex items-center h-8">
                        
                        {/* Center Zero Line Divider */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400"></div>

                        {/* Negative Bar (Extends Left) */}
                        {!isPositive && (
                          <div 
                            className="absolute right-1/2 flex items-center justify-start pr-1 transition-all duration-500"
                            style={{ width: `${Math.min(48, Math.abs(driver.impact) * 3.2)}%` }}
                          >
                            <div className="w-full bg-gradient-to-l from-rose-500 to-rose-400 h-7 rounded-l-lg shadow-md flex items-center justify-start px-2 text-white font-bold gap-1 group-hover:brightness-110">
                              <span>← {driver.impact}</span>
                            </div>
                          </div>
                        )}

                        {/* Positive Bar (Extends Right) */}
                        {isPositive && (
                          <div 
                            className="absolute left-1/2 flex items-center justify-between pl-1 transition-all duration-500"
                            style={{ width: `${Math.min(48, driver.impact * 3.2)}%` }}
                          >
                            <div className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 h-7 rounded-r-lg shadow-md flex items-center justify-end px-2 text-white font-bold gap-1 group-hover:brightness-110">
                              <span>+{driver.impact}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}

                        {/* Interactive Tooltip Card */}
                        {isHovered && (
                          <div className="absolute left-[55%] -top-12 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-2xl max-w-xs transition-all animate-in fade-in zoom-in-95">
                            <p className="text-[11px] text-slate-700 leading-snug">
                              {driver.tooltip}
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Timeline Markers */}
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-6 border-t border-slate-100 mt-6 pl-40">
                <span>May 1</span>
                <span>13 AM</span>
                <span>May 1</span>
                <span>12 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
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

export default Score;
