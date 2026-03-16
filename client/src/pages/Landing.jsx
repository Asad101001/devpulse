import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Github, ArrowRight, Zap, Shield, Cpu, BarChart3, Activity, Command } from 'lucide-react';

const Landing = () => {
  const onLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiBase}/api/v1/auth/github`;
  };

  return (
    <div className="min-h-screen bg-[#FF6B00] text-black font-['Outfit'] selection:bg-black selection:text-[#FFD600] overflow-x-hidden">
      {/* Marquee Top */}
      <div className="bg-black text-white py-3 border-b-[6px] border-black whitespace-nowrap overflow-hidden">
        <div className="inline-block animate-marquee font-[900] uppercase italic text-2xl tracking-tighter">
          OPERATIONAL ANALYTICS // SIGNAL STRENGTH REPORTING // BURNOUT DETECTION MATRIX // GROQ POWERED INFERENCE // NO USER TRACKING // END TO END SIGNAL ENCRYPTION // 
          OPERATIONAL ANALYTICS // SIGNAL STRENGTH REPORTING // BURNOUT DETECTION MATRIX // GROQ POWERED INFERENCE // NO USER TRACKING // END TO END SIGNAL ENCRYPTION // 
        </div>
      </div>

      {/* Header */}
      <nav className="border-b-[6px] border-black p-6 flex justify-between items-center bg-[#FFD600] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black flex items-center justify-center border-4 border-black group">
            <Zap className="text-white w-8 h-8 group-hover:fill-white transition-all" strokeWidth={3} />
          </div>
          <span className="text-4xl font-[900] tracking-tighter uppercase italic">DevPulse</span>
        </div>
        <button 
          onClick={onLogin}
          className="bg-black text-white px-8 py-3 font-[900] text-lg uppercase italic border-4 border-black shadow-[6px_6px_0px_#FF6B00] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
        >
          Initiate Auth
        </button>
      </nav>

      {/* Hero Section */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b-[6px] border-black bg-white">
        <div className="lg:col-span-7 flex flex-col justify-center gap-8 p-10 lg:p-20 border-r-[6px] border-black">
          <div className="inline-block bg-[#FF6B00] text-white px-4 py-1 font-[900] uppercase text-xs self-start rotate-[-2deg] border-2 border-black">
            System Status: Operational
          </div>
          <h1 className="text-6xl md:text-8xl font-[900] leading-[0.85] tracking-tighter uppercase italic">
            ANALYZE <br />
            <span className="bg-black px-4 py-3 text-[#FFD600] inline-block mt-4 rotate-[1deg] border-none">YOUR PULSE.</span>
          </h1>
          <p className="text-xl font-bold leading-[1.2] max-w-xl uppercase italic opacity-70">
            Real-time signal analysis. Burnout risk mitigation. Brutalist telemetry for the high-intensity engineer.
          </p>
          <button 
            onClick={onLogin}
            className="group self-start bg-black text-[#FFD600] px-8 py-5 text-2xl font-[900] uppercase italic border-4 border-black flex items-center gap-4 shadow-[12px_12px_0px_0px_#FF6B00] hover:shadow-none hover:translate-x-4 hover:translate-y-4 transition-all"
          >
            <Github size={32} strokeWidth={3} />
            Connect GitHub
            <ArrowRight size={32} className="group-hover:translate-x-4 transition-transform" />
          </button>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center p-12 bg-black relative overflow-hidden min-h-[500px]">
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'radial-gradient(#FFD600 4px, transparent 4px)', backgroundSize: '60px 60px' }}></div>
          <div className="relative z-10 w-full max-w-xs aspect-square border-[8px] border-[#FFD600] bg-white p-8 flex flex-col justify-between shadow-[24px_24px_0px_0px_#FF6B00] animate-pulse">
             <div className="flex justify-between items-start">
                <Command className="w-16 h-16 text-black" strokeWidth={4} />
                <div className="text-7xl font-[1000] opacity-10">01</div>
             </div>
             <div className="space-y-3">
                <div className="h-4 bg-black w-full"></div>
                <div className="h-4 bg-black w-[90%]"></div>
                <div className="h-4 bg-[#FF6B00] w-[75%]"></div>
             </div>
             <div className="text-4xl font-[900] uppercase tracking-tighter italic leading-none">Hard hitting telemetry.</div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="bg-black text-white py-24 px-10 relative border-b-[6px] border-black">
        <div className="absolute top-20 left-10 text-[15rem] font-[900] opacity-5 select-none pointer-events-none -rotate-6">Pulse IO</div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <LandingFeature 
            icon={<Cpu size={48} strokeWidth={3} />}
            title="AI Engine"
            desc="GROQ POWERED INFERENCE ON EVERY COMMIT. RAW SIGNALS ONLY."
            color="#FF6B00"
          />
          <LandingFeature 
            icon={<Shield size={48} strokeWidth={3} />}
            title="System Integrity"
            desc="ZERO DATA PERSISTENCE. ANALYSIS FLOSSES THROUGH MEMORY."
            color="#FFD600"
            textColor="black"
          />
          <LandingFeature 
            icon={<Activity size={48} strokeWidth={3} />}
            title="Live Telemetry"
            desc="BOXY CHARTS FOR INDUSTRIAL MINDS. OBSERVE YOUR LOAD."
            color="#FFFFFF"
            textColor="black"
          />
        </div>
      </section>

      {/* Operational Pipeline */}
      <section className="bg-[#FF6B00] p-10 lg:p-24 flex flex-col gap-16 border-b-[6px] border-black">
         <h2 className="text-6xl md:text-8xl font-[900] uppercase italic tracking-tighter text-white leading-[0.85]">The Operational <br /> <span className="text-black bg-white px-4">Pipeline.</span></h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <PipelineStep num="01" label="Connect GH" desc="Authorize securely via OAuth Matrix." />
            <PipelineStep num="02" label="Ingest Data" desc="Snapshot 90 cycles of commit history." />
            <PipelineStep num="03" label="AI Inference" desc="Groq Llama 3 parses your cognitive vibe." />
            <PipelineStep num="04" label="Kill Burnout" desc="Actionable wellness directives issued." />
         </div>
      </section>

      {/* Security Manifesto */}
      <section className="bg-white p-10 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-24 border-b-[6px] border-black">
         <div className="space-y-10">
            <h2 className="text-5xl md:text-7xl font-[900] uppercase italic tracking-tighter leading-[0.95]">Hardened Security. <br /> Zero Proxies.</h2>
            <p className="text-xl font-bold leading-tight max-w-xl uppercase italic opacity-60">
               Pulse IO operates on direct-to-metal principles. We don't store passwords. We don't track metrics. We solve burnout with raw engineering.
            </p>
            <div className="flex flex-wrap gap-4">
               <SecurityChip label="AES 256 Signal" />
               <SecurityChip label="TLS 1.3 Encr" />
               <SecurityChip label="JWT Auth Proc" />
            </div>
         </div>
         <div className="bg-black text-[#FFD600] p-12 border-[8px] border-black shadow-[20px_20px_0px_0px_#FF6B00] flex flex-col justify-between group">
            <div className="text-lg font-[900] uppercase tracking-widest opacity-40 mb-8">Encrypted Signal Stream</div>
            <div className="space-y-4">
               <div className="h-3 bg-[#FFD600] w-full group-hover:w-[10%] transition-all duration-1000"></div>
               <div className="h-3 bg-[#FFD600] w-[85%] group-hover:w-[40%] transition-all duration-1000"></div>
               <div className="h-3 bg-[#FFD600] w-[95%] group-hover:w-[20%] transition-all duration-1000"></div>
               <div className="h-3 bg-[#FF6B00] w-[70%] group-hover:w-[90%] transition-all duration-1000"></div>
            </div>
            <div className="text-4xl font-[900] italic uppercase mt-12 leading-none tracking-tighter">Safe. Secure. Brutal.</div>
         </div>
      </section>

      {/* Call To Action */}
      <section className="bg-[#FFD600] py-40 flex flex-col items-center justify-center gap-16 text-center border-b-[6px] border-black">
         <h2 className="text-6xl md:text-9xl font-[900] uppercase italic tracking-tighter leading-[0.8]">Ready To <br /> <span className="bg-black text-white px-8 py-3">Calibrate?</span></h2>
         <button 
            onClick={onLogin}
            className="group bg-black text-[#FFD600] px-16 py-8 text-4xl font-[900] uppercase italic border-8 border-black shadow-[20px_20px_0px_0px_#FF6B00] hover:shadow-none hover:translate-x-6 hover:translate-y-6 transition-all flex items-center gap-6"
          >
            Initiate Sync
            <Zap size={48} strokeWidth={4} className="group-hover:fill-[#FFD600] transition-all" />
         </button>
      </section>

      {/* Marquee Bottom */}
      <div className="bg-black text-[#FFD600] py-8 whitespace-nowrap overflow-hidden border-b-[6px] border-black">
        <div className="inline-block animate-marquee font-[900] uppercase italic text-4xl tracking-tighter">
          CODE BRUTALIST // LIVE WELL // DEVPULSE // NO BULLSHIT // CODE BRUTALIST // LIVE WELL // DEVPULSE // NO BULLSHIT // 
        </div>
      </div>

      {/* Footer */}
      <footer className="p-16 bg-white flex flex-col items-center gap-10">
        <h2 className="text-6xl md:text-[8rem] font-[900] uppercase tracking-tighter italic text-center leading-none">Engineered For <br /><span className="text-[#FF6B00]">Intensity.</span></h2>
        <div className="flex flex-wrap justify-center gap-6">
           <div className="px-8 py-4 bg-black text-white font-[900] uppercase italic border-4 border-black text-xl">© 2026 DevPulse</div>
           <div className="px-8 py-4 bg-[#FF6B00] text-white font-[900] uppercase italic border-4 border-black text-xl tracking-widest animate-pulse">Status: Operational</div>
        </div>
      </footer>
    </div>
  );
};

const LandingFeature = ({ icon, title, desc, color, textColor = 'white' }) => (
  <div style={{ backgroundColor: color, color: textColor }} className="p-12 border-[6px] border-white group hover:rotate-2 transition-transform shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] h-full flex flex-col justify-between">
    <div className="mb-8 scale-125 origin-left">{icon}</div>
    <div>
      <h3 className="text-5xl font-[900] uppercase tracking-tighter mb-6 underline decoration-[8px] mix-blend-difference">{title}</h3>
      <p className="text-xl font-bold leading-tight italic opacity-80">{desc}</p>
    </div>
  </div>
);

const PipelineStep = ({ num, label, desc }) => (
  <div className="bg-white border-[6px] border-black p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform cursor-default flex flex-col h-full">
    <div className="text-6xl font-[900] italic text-[#FF6B00] mb-4 leading-none tracking-tighter">{num}</div>
    <div className="text-2xl font-[900] uppercase tracking-tighter mb-3 border-b-4 border-black pb-2">{label}</div>
    <div className="font-bold text-base opacity-60 leading-tight italic">{desc}</div>
  </div>
);

const SecurityChip = ({ label }) => (
  <div className="px-6 py-3 bg-black text-white font-[1000] uppercase italic border-4 border-black hover:bg-[#FF6B00] transition-colors cursor-default">
    {label}
  </div>
);

export default Landing;
