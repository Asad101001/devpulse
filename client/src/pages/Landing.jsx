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
          SYSTEM ANALYTICS // BURNOUT DETECTION // REAL TIME SENTIMENT // GROQ POWERED // NO TRACKERS // END TO END ENCRYPTION // 
          SYSTEM ANALYTICS // BURNOUT DETECTION // REAL TIME SENTIMENT // GROQ POWERED // NO TRACKERS // END TO END ENCRYPTION // 
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
      <main className="p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-0 border-b-[8px] border-black max-w-[1600px] mx-auto">
        <div className="flex flex-col justify-center gap-6 py-8">
          <div className="inline-block bg-black text-white px-3 py-1.5 font-black uppercase text-xs self-start rotate-[-1deg]">
            System Status: Nominal
          </div>
          <h1 className="text-5xl md:text-6xl font-[1000] leading-[0.85] tracking-tighter uppercase italic">
            Analyze <br />
            <span className="bg-[#FF6B00] px-4 py-2 border-[4px] border-black text-white inline-block mt-3 rotate-[1deg]">Your Pulse.</span>
          </h1>
          <p className="text-xl font-bold leading-tight max-w-lg">
            Real-time sentiment tracking. Burnout prevention. Brutalist analytics for the modern engineer.
          </p>
          <button 
            onClick={onLogin}
            className="group self-start bg-black text-white px-6 py-4 text-xl font-black uppercase italic border-[4px] border-black flex items-center gap-4 hover:bg-white hover:text-black transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
          >
            <Github size={24} />
            Connect GitHub
            <ArrowRight size={24} className="group-hover:translate-x-4 transition-transform" />
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
      <section className="bg-black text-white p-8 lg:p-20 relative">
        <div className="absolute top-0 right-0 p-10 text-9xl font-black opacity-5 rotate-12">DEVPULSE</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <BrutalFeature 
            icon={<Cpu size={48} />}
            title="AI Engine"
            desc="Groq-powered sentiment analysis on every commit. No fluff, just raw signals."
            color="#FF6B00"
          />
          <BrutalFeature 
            icon={<Shield size={48} />}
            title="Privacy First"
            desc="Your code is never stored. Analysis happens in-memory and is discarded instantly."
            color="#FFD600"
            textColor="black"
          />
          <BrutalFeature 
            icon={<BarChart3 size={48} />}
            title="Live Stats"
            desc="Boxy charts for boxy brains. See your cognitive load in high-definition pixels."
            color="#FFFFFF"
            textColor="black"
          />
        </div>
      </section>

      {/* Operational Flow */}
      <section className="bg-[#FF6B00] border-y-[8px] border-black p-8 lg:p-16 flex flex-col gap-20">
         <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">The Operational <br /> <span className="text-black">Pipeline.</span></h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FlowStep num="01" label="Connect GH" desc="Authorize securely via OAuth." />
            <FlowStep num="02" label="Ingest Data" desc="We sync your last 90 days of work." />
            <FlowStep num="03" label="AI Inference" desc="Groq Llama 3 processes your vibe." />
            <FlowStep num="04" label="Kill Burnout" desc="Actionable wellness directives." />
         </div>
      </section>

      {/* Security Block */}
      <section className="bg-white p-8 lg:p-16 border-b-[8px] border-black grid grid-cols-1 lg:grid-cols-2 gap-20">
         <div className="space-y-10">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Hardened Security. <br /> Zero Proxies.</h2>
            <p className="text-xl font-bold leading-relaxed max-w-xl">
               DevPulse operates with direct-to-metal processing. We don't sell data. We don't track users. We solve the burnout problem using raw engineering principles.
            </p>
            <div className="flex gap-4">
               <div className="p-4 bg-black text-white font-black uppercase">AES 256</div>
               <div className="p-4 bg-black text-white font-black uppercase">TLS 1.3</div>
               <div className="p-4 bg-black text-white font-black uppercase">JWT AUTH</div>
            </div>
         </div>
         <div className="bg-black text-[#FFD600] p-12 border-[8px] border-black shadow-[20px_20px_0px_0px_#FF6B00] flex flex-col justify-between">
            <div className="text-xs font-black uppercase tracking-widest opacity-50">ENCRYPTED SIGNAL STREAM</div>
            <div className="space-y-4">
               <div className="h-2 bg-[#FFD600] w-full"></div>
               <div className="h-2 bg-[#FFD600] w-[80%]"></div>
               <div className="h-2 bg-[#FFD600] w-[90%]"></div>
               <div className="h-2 bg-[#FF6B00] w-[60%]"></div>
            </div>
            <div className="text-3xl font-black italic uppercase">Safe. Secure. Brutal.</div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#FFD600] py-40 border-b-[8px] border-black flex flex-col items-center justify-center gap-12 text-center">
         <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">Ready to <br /> <span className="bg-black text-white px-4">Calibrate?</span></h2>
         <button 
            onClick={onLogin}
            className="bg-black text-white px-16 py-8 text-4xl font-black uppercase italic border-[6px] border-black shadow-[15px_15px_0px_0px_#FF6B00] hover:shadow-none hover:translate-x-3 hover:translate-y-3 transition-all"
         >
            INITIATE SYNC NOW
         </button>
      </section>

      {/* Final Marquee */}
      <div className="bg-black text-[#FFD600] py-6 whitespace-nowrap overflow-hidden border-b-[8px] border-black">
        <div className="inline-block animate-marquee font-black uppercase italic text-4xl">
          CODE BRUTALIST // LIVE WELL // DEVPULSE OS // NO BULLSHIT // CODE BRUTALIST // LIVE WELL // DEVPULSE OS // NO BULLSHIT // 
        </div>
      </div>

      {/* Footer */}
      <footer className="p-20 bg-white flex flex-col items-center gap-10">
        <h2 className="text-8xl font-black uppercase tracking-tighter italic text-center">Engineered for <br /><span className="text-[#FF6B00]">Intensity.</span></h2>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-black text-white font-bold uppercase italic border-4 border-black">© 2026 DEVPULSE</div>
           <div className="px-6 py-3 bg-[#FF6B00] text-white font-bold uppercase italic border-4 border-black">STATUS: OPERATIONAL</div>
        </div>
      </footer>
    </div>
  );
};

const BrutalFeature = ({ icon, title, desc, color, textColor = 'white' }) => (
  <div style={{ backgroundColor: color, color: textColor }} className="p-12 border-[6px] border-white group hover:rotate-2 transition-transform shadow-[15px_15px_0px_0px_rgba(255,255,255,0.2)] h-full">
    <div className="mb-10">{icon}</div>
    <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 underline decoration-[8px]">{title}</h3>
    <p className="text-xl font-bold leading-snug">{desc}</p>
  </div>
);

const FlowStep = ({ num, label, desc }) => (
  <div className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform cursor-default">
    <div className="text-5xl font-[1000] italic text-[#FF6B00] mb-4">{num}</div>
    <div className="text-2xl font-black uppercase tracking-tighter mb-2">{label}</div>
    <div className="font-bold text-sm opacity-60 leading-tight">{desc}</div>
  </div>
);

export default Landing;
