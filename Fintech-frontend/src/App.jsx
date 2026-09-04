import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AboutUs from './components/AboutUs'
import Testimonials from './components/Testimonials'
import Login from './pages/login' 
import Dashboard from './pages/Dashboard'
import Score from './pages/Score'
import Forecast from './pages/Forecast'
import Onboarding from './pages/Onboarding'
import Loan from './pages/Loan'
import LoanOfficerDashboard from './pages/LoanOfficerDashboard'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          <div className="min-h-screen bg-[#0b0f19]">
            <Navbar />
            <Hero />
            <AboutUs />
            <Testimonials />
          </div>
        } />

        {/* Authentication & Onboarding */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Loan Officer Dashboard */}
        <Route path="/loan-officer-dashboard" element={<LoanOfficerDashboard />} />

        {/* Dynamic Fintech Dashboard Pages for Business Owners */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/home" element={<Dashboard />} />
        <Route path="/dashboard/transactions" element={<Transactions />} />
        <Route path="/dashboard/score" element={<Score />} />
        <Route path="/dashboard/forecast" element={<Forecast />} />
        <Route path="/dashboard/loan" element={<Loan />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App