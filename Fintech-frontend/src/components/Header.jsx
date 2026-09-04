import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { LogOut, User as UserIcon, AlertCircle } from 'lucide-react';

function Header({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [imgError, setImgError] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Retrieve stored user profile if prop is null/undefined
  const storedUserRaw = localStorage.getItem('user_profile');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const currentUser = user || storedUser || { first_name: 'User', email: 'user@trustledger.com' };

  const userName = currentUser.first_name || 'User';
  const userPic = currentUser.picture;

  const navLinks = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Transactions', path: '/dashboard/transactions' },
    { name: 'Score', path: '/dashboard/score' },
    { name: 'Forecast', path: '/dashboard/forecast' },
    { name: 'Loan Application', path: '/dashboard/loan' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <header className="bg-[#0b101d] text-slate-300 px-6 lg:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/80 select-none shadow-lg sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        
        {/* Left: Brand Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => navigate('/dashboard')}
          >
            <img src={logo} alt="TrustLedger Logo" className="h-7 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-white text-base tracking-tight">
              TrustLedger <span className="text-[#26e6b6]">Dashboard</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/dashboard' && location.pathname === '/dashboard/home');
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`py-1 transition duration-200 ${
                    isActive 
                      ? 'text-[#26e6b6] border-b-2 border-[#26e6b6] font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: User Profile & Improved Logout Button */}
        <div className="flex items-center gap-4">
          
          {/* User Avatar & Details */}
          <div 
            onClick={() => navigate('/dashboard/settings')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition group"
          >
            {userPic && !imgError ? (
              <img 
                src={userPic} 
                alt={userName} 
                onError={() => setImgError(true)}
                className="w-8 h-8 rounded-full border border-[#26e6b6] object-cover shadow-sm group-hover:ring-2 group-hover:ring-[#26e6b6]/40 transition" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#26e6b6] to-teal-600 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-md border border-[#26e6b6]/40">
                {(userName || 'U')[0].toUpperCase()}
              </div>
            )}

            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-none group-hover:text-[#26e6b6] transition">{userName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">{currentUser.email || 'Authenticated User'}</p>
            </div>
          </div>

          {/* Upgraded Logout Button */}
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Logout from session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

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

export default Header;
