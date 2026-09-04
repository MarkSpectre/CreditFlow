import React from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="flex items-center justify-between px-8 py-5 bg-[#0b0f19] text-gray-300 border-b border-slate-800/60 sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/90">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                {/* Logo */}
                <div onClick={() => navigate('/')} className="flex items-center justify-center cursor-pointer">
                    <img src={logo} alt="TrustLedger Logo" className="h-10 w-auto" />
                    <h2 className="ml-2 text-xl font-extrabold text-white tracking-tight">TrustLedger</h2>
                </div>

                {/* Nav Links */}
                <ul className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide cursor-pointer text-slate-300">
                    <li onClick={() => scrollToSection('about')} className="hover:text-[#26e6b6] transition">About Us</li>
                    <li onClick={() => scrollToSection('testimonials')} className="hover:text-[#26e6b6] transition">Testimonials</li>
                    <li onClick={() => navigate('/login')} className="hover:text-[#26e6b6] transition">Underwriting Engine</li>
                    <li onClick={() => navigate('/login')} className="hover:text-[#26e6b6] transition">Lender Portal</li>
                </ul>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate('/login')} 
                      className="px-5 py-2.5 hover:bg-[#1fc49a] transition bg-[#26e6b6] text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-[#26e6b6]/20"
                    >
                      Sign In / Portal
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;