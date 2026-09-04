import React from 'react';
import { Star, Quote, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

function Testimonials() {
  const testimonials = [
    {
      name: "Marcus Vance",
      role: "CEO & Founder",
      company: "Vance Logistics Group",
      type: "Business Owner",
      rating: 5,
      comment: "TrustLedger made securing our $120k expansion loan seamless. Uploading bank statements took 2 minutes, and our dynamic credit score resulted in an instant 8.75% pre-approval!",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      name: "Eleanor Sterling",
      role: "VP of Commercial Lending",
      company: "Apex Capital Bank",
      type: "Loan Officer",
      rating: 5,
      comment: "As a Loan Officer, the Underwriting Console gives us incredible visibility. We get calculated DSCR ratios, parsed transaction streams, and ML risk tiers right at our fingertips.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
      name: "Rajesh K. Patel",
      role: "Managing Director",
      company: "Quantum SaaS Solutions",
      type: "Business Owner",
      rating: 5,
      comment: "The cash flow forecasting model correctly predicted our seasonal revenue dips and helped us maintain optimal working capital balance throughout Q3.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <section id="testimonials" className="relative bg-[#0b0f19] text-white py-20 px-8 md:px-16 border-t border-slate-800/80 overflow-hidden font-sans">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#26e6b6]/10 border border-[#26e6b6]/30 text-[#26e6b6] text-xs font-bold uppercase tracking-wider">
            Verified Feedback
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Trusted by Business Owners & <br />
            <span className="bg-gradient-to-r from-[#26e6b6] to-teal-400 bg-clip-text text-transparent">
              Institutional Loan Officers
            </span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            Read how TrustLedger transforms decision-making for borrowers and lenders alike.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-[#111726]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-[#26e6b6]/50 transition shadow-2xl relative group"
            >
              {/* Quote Icon Background */}
              <Quote className="w-10 h-10 text-slate-800 absolute top-6 right-6 pointer-events-none group-hover:text-[#26e6b6]/20 transition" />

              <div className="space-y-4 relative z-10">
                
                {/* Rating Stars & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    item.type === 'Loan Officer' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-[#26e6b6]/20 text-[#26e6b6] border border-[#26e6b6]/30'
                  }`}>
                    {item.type === 'Loan Officer' ? <ShieldCheck className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                    {item.type}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-slate-300 text-xs leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="w-11 h-11 rounded-full object-cover border border-[#26e6b6]/50 shadow-md"
                />
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {item.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#26e6b6]" />
                  </h4>
                  <p className="text-[11px] text-slate-400">{item.role} • {item.company}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Testimonials;
