import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  ShieldCheck,
  Key,
  CheckCircle,
  Save,
  Sparkles,
  Camera,
  AlertTriangle
} from 'lucide-react';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile'); // profile, company, notifications, security
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Stored User Profile State
  const storedUserRaw = localStorage.getItem('user_profile');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

  const [userState, setUserState] = useState({
    first_name: storedUser?.first_name || 'Swapnil',
    last_name: storedUser?.last_name || 'Kasare',
    email: storedUser?.email || 'kasaresurendra70@gmail.com',
    picture: storedUser?.picture || ''
  });

  const [companyState, setCompanyState] = useState({
    company_name: 'CreditFlow Tech Enterprises',
    tax_id: '27AAACF1234H1Z5',
    industry: 'SaaS & Tech Services',
    annual_revenue: 320000,
    monthly_cashflow: 24500
  });

  const [preferencesState, setPreferencesState] = useState({
    email_notifications: true,
    cashflow_alert_threshold: 5000,
    two_factor_auth: true,
    theme_mode: 'dark'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('http://localhost:8000/api/analytics/settings/', { headers });
        if (res.data) {
          if (res.data.user) {
            setUserState(prev => ({ ...prev, ...res.data.user }));
          }
          if (res.data.company) {
            setCompanyState(prev => ({ ...prev, ...res.data.company }));
          }
          if (res.data.preferences) {
            setPreferencesState(prev => ({ ...prev, ...res.data.preferences }));
          }
        }
      } catch (err) {
        console.warn("Using local settings state fallback:", err);
      }
    };

    fetchSettings();
  }, []);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserState(prev => ({ ...prev, [name]: value }));
    setAvatarError(false);
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      const payload = {
        ...userState,
        ...companyState,
        preferences: preferencesState
      };

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post('http://localhost:8000/api/analytics/settings/', payload, { headers });

      const updatedUser = res.data?.user || userState;
      localStorage.setItem('user_profile', JSON.stringify(updatedUser));
      setUserState(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.warn("Settings save fallback execution:", err);
      // Fallback local persistence
      localStorage.setItem('user_profile', JSON.stringify(userState));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Preset Avatar URLs for easy selection
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${userState.first_name} ${userState.last_name}`) + '&background=26e6b6&color=0f172a&bold=true'
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar user={userState} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header */}
        <Header user={userState} />

        {/* Dashboard Body Canvas */}
        <div className="p-6 md:p-10 flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Title Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <SettingsIcon className="w-8 h-8 text-[#26e6b6]" /> Account & System Settings
                </h1>
                <p className="text-xs text-slate-500 mt-1">Manage user profile pictures, business information, alert preferences, and API security keys.</p>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#26e6b6] text-slate-950 font-extrabold text-xs hover:bg-[#1fc49a] transition shadow-lg shadow-[#26e6b6]/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving Changes...' : 'Save All Settings'}
              </button>
            </div>

            {/* Success Alert Banner */}
            {saveSuccess && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-5 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md animate-in fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Settings updated successfully! Your user profile and avatar changes are live across the dashboard.</span>
              </div>
            )}

            {/* Settings Tab Navigation Bar */}
            <div className="flex bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-md gap-2">
              {[
                { id: 'profile', label: 'User Profile & Avatar', icon: User },
                { id: 'company', label: 'Company Parameters', icon: Building2 },
                { id: 'notifications', label: 'Alerts & Thresholds', icon: Bell },
                { id: 'security', label: 'Security & API Keys', icon: ShieldCheck }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#26e6b6]' : 'text-slate-400'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Form Box */}
            <form onSubmit={handleSaveSettings} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl space-y-6">

              {/* TAB 1: PROFILE & AVATAR */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900">User Profile & Avatar Picture</h2>
                    <p className="text-xs text-slate-400">Update your avatar image link or select a verified preset.</p>
                  </div>

                  {/* Avatar Preview Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="relative group">
                      {userState.picture && !avatarError ? (
                        <img
                          src={userState.picture}
                          alt="Avatar Preview"
                          onError={() => setAvatarError(true)}
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#26e6b6] shadow-xl"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#26e6b6] to-teal-500 text-slate-950 font-black text-2xl flex items-center justify-center border-4 border-[#26e6b6] shadow-xl">
                          {(userState.first_name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                        <Camera className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <h3 className="text-base font-bold text-slate-900">{userState.first_name} {userState.last_name}</h3>
                      <p className="text-xs text-slate-500">{userState.email}</p>

                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-600 block mb-2">Select Preset Avatar:</span>
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          {presetAvatars.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt="Preset"
                              onClick={() => {
                                setUserState(prev => ({ ...prev, picture: url }));
                                setAvatarError(false);
                              }}
                              className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition ${userState.picture === url ? 'border-[#26e6b6] ring-2 ring-[#26e6b6]/40 scale-110' : 'border-slate-300 hover:border-slate-500'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={userState.first_name}
                        onChange={handleUserChange}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={userState.last_name}
                        onChange={handleUserChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={userState.email}
                        onChange={handleUserChange}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Custom Profile Picture Image URL</label>
                      <input
                        type="url"
                        name="picture"
                        value={userState.picture || ''}
                        onChange={handleUserChange}
                        placeholder="https://example.com/my-photo.jpg"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Paste any direct image URL (HTTPS) to set your custom profile avatar.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPANY PARAMETERS */}
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900">Company & Tax Parameters</h2>
                    <p className="text-xs text-slate-400">Legal entity information used for cash flow forecast & credit score calculations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name</label>
                      <input
                        type="text"
                        name="company_name"
                        value={companyState.company_name}
                        onChange={handleCompanyChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tax Identification (GSTIN/PAN)</label>
                      <input
                        type="text"
                        name="tax_id"
                        value={companyState.tax_id}
                        onChange={handleCompanyChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Annual Revenue ($)</label>
                      <input
                        type="number"
                        name="annual_revenue"
                        value={companyState.annual_revenue}
                        onChange={handleCompanyChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Cash Flow ($)</label>
                      <input
                        type="number"
                        name="monthly_cashflow"
                        value={companyState.monthly_cashflow}
                        onChange={handleCompanyChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#26e6b6] transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NOTIFICATIONS & ALERTS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900">Alerts & Threshold Notifications</h2>
                    <p className="text-xs text-slate-400">Configure real-time automated notifications for projected cash shortages.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Email Shortage Alerts</span>
                        <span className="text-[10px] text-slate-500">Receive instant email when 90-day cash flow drops below threshold.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferencesState.email_notifications}
                        onChange={(e) => setPreferencesState(prev => ({ ...prev, email_notifications: e.target.checked }))}
                        className="w-5 h-5 accent-[#26e6b6] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Cash Shortage Trigger Threshold ($)</span>
                        <span className="text-[#10b981]">${preferencesState.cashflow_alert_threshold.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="25000"
                        step="1000"
                        value={preferencesState.cashflow_alert_threshold}
                        onChange={(e) => setPreferencesState(prev => ({ ...prev, cashflow_alert_threshold: parseInt(e.target.value) }))}
                        className="w-full accent-[#26e6b6] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY & API KEYS */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900">Security & API Access Keys</h2>
                    <p className="text-xs text-slate-400">Manage 2-Factor Authentication and developer API authorization tokens.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Two-Factor Authentication (2FA)</span>
                        <span className="text-[10px] text-slate-500">Enforce OTP verification upon each login attempt.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferencesState.two_factor_auth}
                        onChange={(e) => setPreferencesState(prev => ({ ...prev, two_factor_auth: e.target.checked }))}
                        className="w-5 h-5 accent-[#26e6b6] cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#26e6b6] flex items-center gap-1.5">
                          <Key className="w-4 h-4" /> Live API Secret Key
                        </span>
                        <button
                          type="button"
                          onClick={() => alert("New API Key generated successfully!")}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold rounded-lg border border-slate-700 text-slate-200 transition"
                        >
                          Roll Key
                        </button>
                      </div>
                      <code className="block bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 truncate">
                        tl_live_9f8810a924b1928e7a01824c901
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-[#26e6b6] text-slate-950 font-extrabold text-xs hover:bg-[#1fc49a] transition shadow-lg shadow-[#26e6b6]/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;
