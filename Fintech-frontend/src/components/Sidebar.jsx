import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { 
  Home, 
  ArrowLeftRight, 
  Gauge, 
  TrendingUp, 
  Settings,
  Landmark,
  LogOut,
  AlertCircle
} from 'lucide-react';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [imgError, setImgError] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Retrieve stored user profile if prop is null/undefined
  const storedUserRaw = localStorage.getItem('user_profile');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const currentUser = user || storedUser;

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Transactions', path: '/dashboard/transactions', icon: ArrowLeftRight },
    { name: 'Score', path: '/dashboard/score', icon: Gauge },
    { name: 'Forecast', path: '/dashboard/forecast', icon: TrendingUp },
    { name: 'Loan Application', path: '/dashboard/loan', icon: Landmark },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      <div className="w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col justify-between p-4 min-h-screen text-slate-300 select-none shrink-0">
        
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src={logo} alt="TrustLedger Logo" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">TrustLedger</h1>
              <p className="text-[11px] text-slate-400 font-medium">Dashboard</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/home');
              
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#141d30] text-[#26e6b6] shadow-sm border border-[#26e6b6]/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121828]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#26e6b6]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & Improved Logout Button */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          {currentUser && (
            <div 
              onClick={() => navigate('/dashboard/settings')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#121828] border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
            >
              {currentUser.picture && !imgError ? (
                <img 
                  src={currentUser.picture} 
                  alt={currentUser.first_name} 
                  onError={() => setImgError(true)}
                  className="w-9 h-9 rounded-full object-cover border border-[#26e6b6] shadow-sm" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#26e6b6] to-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md border border-[#26e6b6]/30">
                  {(currentUser.first_name || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-white group-hover:text-[#26e6b6] transition truncate">
                  {currentUser.first_name} {currentUser.last_name || ''}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email || 'Authenticated User'}</p>
              </div>
            </div>
          )}

          {/* Redesigned Logout Button */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200 shadow-sm active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white">Log Out Confirmation</h3>
              <p className="text-xs text-slate-400 mt-1">Are you sure you want to log out of your TrustLedger session?</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
