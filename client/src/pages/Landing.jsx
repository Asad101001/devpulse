import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Github, ArrowRight, Zap, Shield, Cpu, BarChart3 } from 'lucide-react';

const Landing = () => {
  const { handleLogin } = useAuth();
  
  const onLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiBase}/api/v1/auth/github`;
  };

  return (
    <div className="min-h-screen bg-[#FFD600] text-black font-['Outfit'] selection:bg-black selection:text-[#FFD600] overflow-x-hidden">
      {/* Marquee */}
      <div className="bg-black text-white py-4 border-b-[8px] border-black whitespace-nowrap overflow-hidden">
        <div className="inline-block animate-marquee font-black uppercase italic text-2xl">
          SYSTEM_ANALYTICS // BURNOUT_DETECTION // REAL_TIME_SENTIMENT // GROQ_POWERED // NO_TRACKERS // END_TO_END_ENCRYPTION // 
          SYSTEM_ANALYTICS // BURNOUT_DETECTION // REAL_TIME_SENTIMENT // GROQ_POWERED // NO_TRACKERS // END_TO_END_ENCRYPTION // 
        </div>
      </div>

      {/* Header */}
      <nav className="border-b-[8px] border-black p-8 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black flex items-center justify-center border-4 border-black">
            <Zap className="text-[#FFD600] w-8 h-8" strokeWidth={3} />
          </div>
          <span className="text-4xl font-[900] tracking-tighter uppercase italic">DevPulse</span>
        </div>
        <button 
          onClick={onLogin}
          className="bg-black text-white px-8 py-3 font-black text-sm uppercase tracking-tighter border-4 border-black hover:bg-[#FF6B00] transition-colors"
        >
          Login
        </button>
      </nav>

      {/* Hero */}
      <main className="p-8 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-0 border-b-[8px] border-black">
        <div className="flex flex-col justify-center gap-10 py-20">
          <div className="inline-block bg-black text-white p-4 font-black uppercase text-xl self-start rotate-[-1deg]">
            System Status: Nominal
          </div>
          <h1 className="text-7xl md:text-[9rem] font-[900] leading-[0.85] tracking-tighter uppercase italic">
            Analyze <br />
            <span className="bg-[#FF6B00] px-4 py-2 border-[6px] border-black text-white inline-block mt-4 rotate-[1deg]">Your Pulse.</span>
          </h1>
          <p className="text-3xl font-bold leading-tight max-w-xl">
            Real-time sentiment tracking. Burnout prevention. Brutalist analytics for the modern engineer.
          </p>
          <button 
            onClick={onLogin}
            className="group self-start bg-black text-white px-12 py-8 text-3xl font-[900] uppercase italic border-[6px] border-black flex items-center gap-6 hover:bg-white hover:text-black transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-3 hover:translate-y-3"
          >
            <Github size={40} />
            Connect GitHub
            <ArrowRight size={40} className="group-hover:translate-x-4 transition-transform" />
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-center p-20 bg-black border-l-[8px] border-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(#FFD600 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10 w-full aspect-square border-[8px] border-[#FFD600] bg-white p-12 flex flex-col justify-between shadow-[20px_20px_0px_0px_#FF6B00]">
             <div className="flex justify-between items-start">
                <div className="w-20 h-20 bg-black"></div>
                <div className="text-9xl font-black opacity-10">01</div>
             </div>
             <div className="space-y-6">
                <div className="h-4 bg-black w-full"></div>
                <div className="h-4 bg-black w-[80%]"></div>
                <div className="h-4 bg-[#FF6B00] w-[60%]"></div>
             </div>
             <div className="text-4xl font-black uppercase tracking-tighter">Hard-Hitting Data.</div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="bg-black text-white p-8 lg:p-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <BrutalFeature 
            icon={<Cpu size={48} />}
            title="AI Engine"
            desc="Groq-powered sentiment analysis on every commit. No fluff."
            color="#FF6B00"
          />
          <BrutalFeature 
            icon={<Shield size={48} />}
            title="Privacy First"
            desc="Your data is analyzed and discarded. Zero tracking."
            color="#FFD600"
            textColor="black"
          />
          <BrutalFeature 
            icon={<BarChart3 size={48} />}
            title="Live Stats"
            desc="Boxy charts for boxy brains. See your mood in pixels."
            color="#FFFFFF"
            textColor="black"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[8px] border-black p-20 bg-white flex flex-col items-center gap-10">
        <h2 className="text-8xl font-black uppercase tracking-tighter italic text-center">Engineered for <br /><span className="text-[#FF6B00]">Intensity.</span></h2>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-black text-white font-bold uppercase italic border-4 border-black">© 2026 DEVPULSE</div>
           <div className="px-6 py-3 bg-[#FF6B00] text-white font-bold uppercase italic border-4 border-black">STATUS: LIVE</div>
        </div>
      </footer>
    </div>
  );
};

const BrutalFeature = ({ icon, title, desc, color, textColor = 'white' }) => (
  <div style={{ backgroundColor: color, color: textColor }} className="p-12 border-[6px] border-white group hover:rotate-2 transition-transform shadow-[15px_15px_0px_0px_rgba(255,255,255,0.2)]">
    <div className="mb-10">{icon}</div>
    <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 underline decoration-[8px]">{title}</h3>
    <p className="text-xl font-bold leading-snug">{desc}</p>
  </div>
);

export default Landing;
