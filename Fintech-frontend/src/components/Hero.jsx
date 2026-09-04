import React, { useRef, useState } from 'react';
import heroImg from '../assets/heroImg.png'; 

function Hero() {
  const cardRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate dynamic shifts based on cursor location
    const maxDynamicTilt = 12; // Maximum extra tilt added by mouse movement
    const dynamicY = (mouseX / (box.width / 2)) * maxDynamicTilt;
    const dynamicX = -(mouseY / (box.height / 2)) * maxDynamicTilt;

    setMouseOffset({ x: dynamicX, y: dynamicY });
  };

  const handleMouseLeave = () => {
    // Smoothly return back to the baseline 3D perspective angle
    setMouseOffset({ x: 0, y: 0 });
  };

  // BASELINE 3D ANGLE: Adjust these values to change how the card looks at rest
  const baseRotateX = 12;   // Tilts the top of the card backwards
  const baseRotateY = -15;  // Rotates the card slightly sideways
  const baseRotateZ = 5;    // Adds a subtle counter-clockwise spin

  return (
    <section className="relative min-h-[calc(100vh-76px)] bg-[#0b0f19] text-white flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12 gap-12 overflow-hidden">
      
      {/* Background Grid Layer */}
      <div className="absolute right-0 top-0 w-full md:w-[60%] h-full pointer-events-none select-none z-0">
        <div 
          className="absolute inset-0 opacity-30 tech-3d-grid" 
          style={{
            '--grid-rx': `${mouseOffset.x * 0.2}deg`,
            '--grid-ry': `${mouseOffset.y * 0.2}deg`
          }}
        />
      </div>

      {/* Left Text Content Container */}
      <div className="relative max-w-xl space-y-6 z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Cash Flow <br />
          <span className="bg-gradient-to-r from-[#26e6b6] to-teal-400 bg-clip-text text-transparent">
            Intelligence for Modern Lending
          </span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Empower your platform with real-time financial data, automated credit risk analysis, 
          and streamlined underwriting – all integrated via a single API.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <button className="bg-[#26e6b6] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#1fc49a] transition">
            Get Started Free
          </button>
          <button className="border border-gray-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition">
            Talk to Sales
          </button>
        </div>
      </div>

      {/* Right Dashboard Interactive Viewport */}
      <div 
        className="relative flex-1 flex justify-center items-center w-full max-w-2xl [perspective:1200px] z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Colorful dual glow layers beneath the card for extra depth pop */}
        <div className="absolute w-80 h-80 bg-[#26e6b6]/15 blur-3xl rounded-full pointer-events-none translate-x-[-10%]"></div>
        <div className="absolute w-60 h-60 bg-amber-500/10 blur-3xl rounded-full bottom-0 right-10 pointer-events-none"></div>
        
        {/* This container manages the combined base 3D angle and hover manipulation */}
        <div
          ref={cardRef}
          style={{
            transform: `
              rotateX(${baseRotateX + mouseOffset.x}deg) 
              rotateY(${baseRotateY + mouseOffset.y}deg) 
              rotateZ(${baseRotateZ}deg)
              scale3d(1.02, 1.02, 1.02)
            `,
          }}
          className="w-full h-auto transition-transform duration-300 ease-out will-change-transform transform-style-3d"
        >
          <img 
            src={heroImg} 
            alt="Financial Dashboard Analytics" 
            className="w-full h-auto object-contain z-10 drop-shadow-[0_35px_60px_rgba(38,230,182,0.25)] select-none pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;