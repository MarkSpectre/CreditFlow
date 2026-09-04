import React from 'react';
import { ShieldCheck, Cpu, LineChart, Zap, Award, CheckCircle2 } from 'lucide-react';

function AboutUs() {
  const stats = [
    { label: "Capital Underwritten", value: "$500M+", change: "+42% YoY" },
    { label: "ML Scoring Accuracy", value: "99.4%", change: "Validated" },
    { label: "Decision Speed", value: "< 2 Mins", change: "Real-time" },
    { label: "SMBs & Lenders", value: "15,000+", change: "Global" }
  ];

  const pillars = [
    {
      icon: LineChart,
      title: "Real-Time Bank Stream OCR",
      description: "Instantly parse GSTIN records and raw PDF/CSV bank streams to extract structured cashflow metrics."
    },
    {
      icon: Cpu,
      title: "Automated ML Underwriting",
      description: "Our multi-dimensional scoring engine evaluates DSCR, volatility, and credit age within milliseconds."
    },
    {
      icon: ShieldCheck,
      title: "Institutional Risk Controls",
      description: "Empower loan officers with granular applicant financial breakdowns, debt-to-income analysis, and collateral audit tools."
    }
  ];

  return (
    <section id="about" className="relative bg-[#0b0f19] text-white py-20 px-8 md:px-16 border-t border-slate-800/80 overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#26e6b6]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#26e6b6]/10 border border-[#26e6b6]/30 text-[#26e6b6] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> About TrustLedger
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Revolutionizing Business Credit with <br />
            <span className="bg-gradient-to-r from-[#26e6b6] to-teal-400 bg-clip-text text-transparent">
              Automated Financial Intelligence
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            TrustLedger bridges the gap between ambitious business owners seeking growth capital and loan officers evaluating credit risk. Our end-to-end platform processes real-time transaction streams into actionable underwriting decisions.
          </p>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-[#111726]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center hover:border-[#26e6b6]/50 transition shadow-xl">
              <p className="text-3xl md:text-4xl font-extrabold text-[#26e6b6]">{stat.value}</p>
              <p className="text-xs font-bold text-white mt-1">{stat.label}</p>
              <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* 3 Technical Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div key={idx} className="bg-[#111726]/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 hover:border-[#26e6b6]/40 transition shadow-2xl flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#26e6b6]/10 text-[#26e6b6] flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{pillar.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-[11px] font-semibold text-[#26e6b6]">
                  <CheckCircle2 className="w-4 h-4" /> Enterprise Grade Security
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default AboutUs;
