import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api.js';
// html-to-image is loaded via CDN in index.html for maximum stability
import { 
  LogOut, 
  Activity, 
  Zap, 
  Settings, 
  Github, 
  ArrowUpRight, 
  RefreshCw, 
  Flame,
  MessageSquare,
  Clock,
  LayoutDashboard,
  History,
  Cpu,
  Shield,
  Image as ImageIcon,
  X,
  Download,
  BarChart,
  Code
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';


const Dashboard = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [stats, setStats] = React.useState(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('summary');
  const [config, setConfig] = React.useState({
    precision: 'standard',
    density: 'M'
  });
  const [notification, setNotification] = React.useState(null);
  const [overrideModal, setOverrideModal] = React.useState(null);
  const posterRef = useRef(null);
  const reportRef = useRef(null);

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/data/stats');
      setStats(data.data);
      setIsSyncing(data.data.syncStatus === 'syncing');
    } catch (err) {
      // Silence background errors for clean production build
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) fetchStats();
  }, [isAuthenticated]);

  React.useEffect(() => {
    let interval;
    if (isSyncing) interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [isSyncing]);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await api.post('/data/sync');
    } catch (err) {
      console.error('Sync failed:', err.message);
      setIsSyncing(false);
    }
  };

  const handleReset = async () => {
    setOverrideModal({
      title: 'FACTORY_RESET_PURGE',
      message: 'FATAL: This will wipe all local intelligence data and reset the sync matrix. All local cognitive history will be lost. Proceed?',
      onConfirm: async () => {
        try {
          await api.post('/data/reset');
          notify('SIGNAL_WIPED. Reloading system...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          notify('PURGE_FAILED: System logic error.', 'error');
        }
        setOverrideModal(null);
      }
    });
  };

  const downloadReport = async () => {
    if (reportRef.current === null) return;
    notify('COMPILING_INTELLIGENCE_REPORT...', 'info');
    try {
      const dataUrl = await window.htmlToImage.toPng(reportRef.current, { 
        cacheBust: true,
        backgroundColor: '#000',
        pixelRatio: 3
      });
      const link = document.createElement('a');
      link.download = `devpulse-report-${user?.username || 'signal'}.png`;
      link.href = dataUrl;
      link.click();
      notify('REPORT_EXTRACTED_SUCCESSFULLY', 'success');
    } catch (err) {
      notify('REPORT_EXTRACTION_FAILED_OVERLOAD', 'error');
    }
  };

  const downloadPoster = async () => {
    if (posterRef.current === null) return;
    notify('GENERATING_SIGNAL_IMAGE...', 'info');
    try {
      const dataUrl = await window.htmlToImage.toPng(posterRef.current, { 
        cacheBust: true,
        backgroundColor: '#000',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `devpulse-wrapped-${user?.username || 'signal'}.png`;
      link.href = dataUrl;
      link.click();
      notify('IMAGE_EXTRACTED_SUCCESSFULLY', 'success');
    } catch (err) {
      notify('EXTRACTION_FAILED_UNSTABLE_RENDER', 'error');
    }
  };


  if (loading || (isAuthenticated && !stats)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="bg-[#FF6B00] p-6 border-[6px] border-white text-white font-[900] text-2xl animate-pulse italic uppercase">
          Initializing Dashboard...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const m = stats.metrics;
  const getVibeColor = (score) => score > 70 ? '#4ADE80' : score < 40 ? '#F87171' : '#FFD600';
  const getBurnoutColor = (score) => score > 60 ? '#F87171' : score < 30 ? '#4ADE80' : '#FF6B00';

  return (
    <div className={`min-h-screen bg-white text-black font-['Outfit'] flex flex-col md:flex-row overflow-hidden ${config.density === 'S' ? 'text-sm' : config.density === 'L' ? 'text-lg' : 'text-base'}`}>
      {notification && (
        <div className={`fixed top-6 right-6 z-[120] p-4 border-[4px] border-black shadow-[6px_6px_0px_#000] font-black uppercase italic animate-in slide-in-from-right duration-300 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 
          notification.type === 'success' ? 'bg-[#4ADE80] text-black' : 'bg-[#FFD600] text-black'
        }`}>
          {notification.msg}
        </div>
      )}
      {overrideModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[8px] border-black max-w-md w-full p-8 shadow-[20px_20px_0px_#F87171] animate-in zoom-in duration-200">
            <h2 className="text-3xl font-[1000] text-black uppercase italic mb-4 border-b-4 border-black pb-2 flex items-center gap-3">
              <Shield size={32} className="text-red-500" /> {overrideModal.title}
            </h2>
            <p className="text-sm font-bold uppercase mb-8 leading-tight italic">{overrideModal.message}</p>
            <div className="flex gap-4">
              <button 
                onClick={overrideModal.onConfirm}
                className="flex-1 bg-black text-white py-4 font-black uppercase italic border-4 border-black hover:bg-red-500 transition-all"
              >
                PROCEED_PURGE
              </button>
              <button 
                onClick={() => setOverrideModal(null)}
                className="flex-1 bg-white text-black py-4 font-black uppercase italic border-4 border-black hover:bg-gray-100 transition-all"
              >
                ABORT_SIGNAL
              </button>
            </div>
          </div>
        </div>
      )}
      <aside className="w-full md:w-60 bg-black text-white border-r-[6px] border-black flex flex-col sticky top-0 md:h-screen z-20">
        <div className="p-5 border-b-[6px] border-white flex items-center gap-3 bg-[#FF6B00]">
          <Zap className="text-white w-6 h-6" strokeWidth={3} />
          <span className="text-xl font-[900] tracking-tighter uppercase italic">DevPulse</span>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={18}/>} label="Operational Feed" active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
          <SidebarItem icon={<Github size={18}/>} label="Repository Stats" active={activeTab === 'repos'} onClick={() => setActiveTab('repos')} />
          <SidebarItem icon={<ImageIcon size={18}/>} label="Wrapped Signal" active={activeTab === 'wrapped'} onClick={() => setActiveTab('wrapped')} />
          <SidebarItem icon={<Settings size={18}/>} label="System Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-5 border-t-[6px] border-white space-y-3">
          <button 
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }} 
            className="w-full bg-white text-black p-2.5 border-4 border-black font-[900] uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#F87171] transition-all shadow-[4px_4px_0px_0px_#FFD600]"
          >
            <LogOut size={16} /> End Session
          </button>
        </div>
      </aside>

      <main className={`flex-1 bg-[#FFD600] border-l-[6px] border-black p-4 md:p-6 space-y-6 overflow-y-auto h-screen selection:bg-black selection:text-[#FFD600] ${config.density === 'S' ? 'gap-2' : config.density === 'L' ? 'gap-10' : 'gap-6'}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-[6px] border-black pb-6">
          <div>
            <div className="inline-block bg-black text-white px-2 py-0.5 font-black uppercase tracking-widest text-[9px] mb-3">
              Sync Status: {isSyncing ? 'Active Scanning' : 'Ready'} // Last: {new Date(stats.lastSyncedAt).toLocaleTimeString()}
            </div>
            <h1 className="text-4xl font-[900] text-black tracking-tighter leading-none italic uppercase">
              {activeTab === 'summary' ? 'Operational Feed.' : activeTab === 'repos' ? 'Repository Stats.' : activeTab === 'wrapped' ? 'Wrapped Signal.' : 'System Settings.'}
            </h1>
          </div>
          {activeTab === 'summary' && (
            <button onClick={handleSync} disabled={isSyncing} className={`bg-black text-white px-6 py-3 text-lg font-[900] uppercase italic border-4 border-black flex items-center gap-2 transition-all shadow-[6px_6px_0px_0px_#FF6B00] ${isSyncing ? 'opacity-50' : 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}>
              <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Syncing...' : 'Signal Sync'}
            </button>
          )}
        </div>

        {activeTab === 'summary' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatBox label="Flow Sentiment" value={`${m.avgSentiment}%`} desc="Average cognitive tone of commits." color="white" statusColor={getVibeColor(m.avgSentiment)} />
              <StatBox label="Burnout Risk" value={`${m.avgBurnout}%`} desc="Intensity vs recovery balance." color="white" statusColor={getBurnoutColor(m.avgBurnout)} />
              <StatBox label="Cognitive Load" value={m.cognitiveLoad} desc="Commit complexity & scale." color="white" />
              <StatBox label="Signal Stability" value={m.signalStability} desc="Consistency of engineering output." color="white" />
              <StatBox label="Linguistic Prec" value={m.linguisticPrecision} desc="Technical detail in documentation." color="white" />
              <StatBox label="Active Signals" value={m.totalCommits} desc="Total data points ingested." color="black" textColor="white" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 flex flex-col gap-6">
                {m.totalCommits === 0 && !isSyncing ? (
                  <div className="bg-black text-[#FFD600] p-12 border-[8px] border-black shadow-[20px_20px_0px_#FF6B00] flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                    <Activity size={80} className="mb-6 animate-pulse" />
                    <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-4">NO_SIGNAL_DETECTED</h2>
                    <p className="max-w-md font-bold opacity-60 uppercase italic mb-8">System is in standby. Ingest GitHub telemetry to populate the intelligence matrix.</p>
                    <button onClick={handleSync} className="bg-[#FF6B00] text-white px-10 py-5 text-2xl font-[900] uppercase italic border-4 border-black shadow-[8px_8px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                      Initial Signal Ingest
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white border-[6px] border-black p-6 shadow-[10px_10px_0px_0px_#000]">
                      <h2 className="text-2xl font-[900] uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-3 flex items-center gap-3">
                        <Cpu className="text-[#FF6B00]" size={28} />
                        AI Insights & Signals
                      </h2>
                      <div className="space-y-3">
                        {stats.recentCommits?.map((commit, idx) => (
                          <div key={idx} className="p-3.5 border-4 border-black bg-white group hover:bg-black hover:text-white transition-all cursor-default relative overflow-hidden">
                             <div className="flex justify-between items-start mb-1.5">
                                <span className="text-[9px] font-black uppercase bg-[#FFD600] text-black px-1.5 py-0.5 border-2 border-black inline-block">{commit.repoId?.name}</span>
                                <span className="text-[9px] font-bold opacity-40 group-hover:opacity-100">{new Date(commit.timestamp).toLocaleDateString()}</span>
                             </div>
                             <div className="text-lg font-[900] uppercase italic tracking-tight mb-2">"{commit.message}"</div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-[#FFD600]/10 border-l-4 border-[#FF6B00] text-[11px] font-bold leading-snug group-hover:bg-[#FF6B00]/20">
                                   <span className="text-[#FF6B00] group-hover:text-[#FFD600] uppercase block mb-1">System Brief:</span> {commit.aiSummary || 'Analysis pending...'}
                                </div>
                                <div className="p-3 bg-black/5 border-l-4 border-black text-[11px] font-bold leading-snug group-hover:bg-white/10">
                                   <span className="text-black group-hover:text-white uppercase block mb-1">Recommendation:</span> {commit.aiRecommendation || 'Awaiting signal processing...'}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border-[6px] border-black p-5 shadow-[8px_8px_0px_0px_#000]">
                            <h3 className="text-lg font-[900] uppercase italic mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                               <BarChart size={18} className="text-[#FF6B00]" /> Signal Intensity Matrix
                            </h3>
                            <div className="h-[240px] w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <ReBarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                     <XAxis dataKey="name" axisLine={{ strokeWidth: 4 }} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                     <YAxis domain={[0, 100]} axisLine={{ strokeWidth: 4 }} tick={{ fontSize: 10, fontWeight: 900 }} />
                                     <Tooltip 
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="bg-black text-white p-3 border-2 border-[#FF6B00] font-black uppercase text-[10px] italic">
                                                <p>{`Sentiment: ${payload[0].value}%`}</p>
                                                <p>{`Load: ${payload[1].value}%`}</p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                     />
                                     <Bar dataKey="score" fill="#FF6B00" radius={[2, 2, 0, 0]} name="Sentiment" />
                                     <Bar dataKey="load" fill="#000" radius={[2, 2, 0, 0]} name="Load" />
                                  </ReBarChart>
                               </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-2 text-[9px] font-black uppercase italic">
                               <div className="flex items-center gap-1"><span className="w-2 h-2 bg-[#FF6B00]"></span> Sentiment</div>
                               <div className="flex items-center gap-1"><span className="w-2 h-2 bg-black"></span> Load</div>
                            </div>
                        </div>

                        <div className="bg-white border-[6px] border-black p-5 shadow-[8px_8px_0px_0px_#000]">
                            <h3 className="text-lg font-[900] uppercase italic mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                               <Activity size={18} className="text-[#FF6B00]" /> Operational Radar
                            </h3>
                            <div className="h-[240px] w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                     { subject: 'Intensity', A: m.avgSentiment, fullMark: 100 },
                                     { subject: 'Stability', A: parseInt(m.signalStability), fullMark: 100 },
                                     { subject: 'Cognitive', A: parseInt(m.cognitiveLoad), fullMark: 100 },
                                     { subject: 'Volume', A: Math.min(m.totalCommits * 2, 100), fullMark: 100 },
                                     { subject: 'Precision', A: Math.min(parseInt(m.linguisticPrecision) * 5, 100), fullMark: 100 },
                                  ]}>
                                     <PolarGrid stroke="#000" strokeWidth={1} />
                                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 9, fontWeight: '900' }} />
                                     <Radar name="Metrics" dataKey="A" stroke="#000" strokeWidth={3} fill="#FF6B00" fillOpacity={0.8} />
                                  </RadarChart>
                               </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#FF6B00] text-white p-6 border-[6px] border-black shadow-[10px_10px_0px_0px_#000] relative group">
                  <div className="absolute top-4 right-4 animate-pulse">
                    <Zap size={32} className="text-white fill-white" />
                  </div>
                  <h3 className="text-2xl font-[900] uppercase italic mb-8 border-b-4 border-white pb-2 underline decoration-[4px]">Dev Report</h3>
                  <div className="space-y-4 font-[900] uppercase italic">
                      <div className="p-5 bg-black border-[4px] border-white shadow-[6px_6px_0px_#000]">
                        <div className="text-[9px] text-[#FFD600] mb-2 tracking-widest whitespace-nowrap">PEAK COGNITIVE MOOD</div>
                        <div className="text-4xl glitch-text" style={{color: getVibeColor(m.avgSentiment)}}>{m.topMood}</div>
                      </div>
                      
                      <div className="p-5 bg-white text-black border-[4px] border-black shadow-[6px_6px_0px_#000] rotate-[-1deg]">
                        <div className="text-[10px] font-black uppercase text-[#FF6B00] mb-2">Executive Directive:</div>
                        <div className="text-sm font-[900] italic leading-tight uppercase underline decoration-black/40 decoration-2">{m.executiveDirective}</div>
                      </div>

                      <div className="p-3 bg-white text-black border-[2px] border-black font-bold text-[10px]">
                        SYSTEM STATUS: <span className="text-[#FF6B00]">SYNCED</span><br/>
                        RESONANCE: <span className="underline">{m.emotionalResonance}</span>
                      </div>
                  </div>
                </div>

                <div className="bg-black p-8 border-[6px] border-black flex flex-col gap-6 shadow-[10px_10px_0px_white]">
                   <h3 className="text-[#FFD600] font-[900] uppercase italic border-b-2 border-[#FFD600]/20 pb-2">Operational Health Index</h3>
                   <div className="space-y-4">
                      <HealthBar label="Burnout Tolerance" value={100 - m.avgBurnout} color="#F87171" bg="#450a0a" />
                      <HealthBar label="Signal Integrity" value={parseInt(m.signalStability)} color="#4ADE80" bg="#064e3b" />
                      <HealthBar label="Cognitive Buffer" value={100 - parseInt(m.cognitiveLoad)} color="#FFD600" bg="#422006" />
                   </div>
                   <div className="text-center pt-2">
                      <div className="text-white text-[10px] font-bold opacity-40 uppercase tracking-widest">Aggregate Stability: {m.signalStability}</div>
                   </div>
                </div>

                <div className="bg-white p-5 border-[6px] border-black space-y-3 shadow-[8px_8px_0px_#FFD600]">
                   <h4 className="text-xl font-[900] uppercase italic flex items-center gap-2 border-b-2 border-black pb-2">
                      <Shield size={20} className="text-[#FF6B00]" /> Intelligence Statistics
                   </h4>
                   <p className="text-[10px] font-black leading-tight bg-[#FFD600]/20 p-3 border-2 border-black italic">
                      LOAD: {m.cognitiveLoad} | STABILITY: {m.signalStability}<br/>PRECISION: {m.linguisticPrecision}
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'repos' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stats.repoList?.map((repo, idx) => (
                <div key={idx} className="bg-white border-[6px] border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default group">
                    <div className="flex justify-between items-start mb-4">
                       <Github size={36} className="text-[#FF6B00] group-hover:rotate-12 transition-transform" />
                       <a href={`https://github.com/${user?.username}/${repo.name}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#FFD600] border-2 border-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0px_0px_#000] hover:shadow-none">
                          <ArrowUpRight size={20} />
                       </a>
                    </div>
                    <h3 className="text-2xl font-[900] uppercase italic mb-1 truncate border-b-2 border-black pb-1">{repo.name}</h3>
                    <div className="text-[10px] font-black opacity-40 mb-3 italic">Last Active: {new Date(repo.lastActivity).toLocaleDateString()}</div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                       <div className="bg-black text-white p-2 border-2 border-black text-center">
                          <div className="text-[8px] opacity-60">COMMITS</div>
                          <div className="text-xl font-[900]">{repo.commitCount}</div>
                       </div>
                       <div className="bg-[#FF6B00] text-white p-2 border-2 border-black text-center">
                          <div className="text-[8px] opacity-60">LOAD</div>
                          <div className="text-xl font-[900]">{Math.min(Math.round(repo.commitCount / 5), 100)}%</div>
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                       <div className="text-[9px] font-[900] uppercase bg-[#FFD600] px-2 py-0.5 border-2 border-black">{repo.language || 'DATA'}</div>
                       <div className={`text-[9px] font-[900] uppercase px-2 py-0.5 border-2 border-black ${repo.isPrivate ? 'bg-black text-white' : 'bg-white text-black'}`}>
                         {repo.isPrivate ? 'PRIVATE_SIGNAL' : 'PUBLIC_SIGNAL'}
                       </div>
                    </div>
                    <p className="text-xs font-bold opacity-70 leading-snug h-10 line-clamp-3">{repo.description || 'No metadata available for this command.'}</p>
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-black flex justify-between items-center text-[9px] font-black uppercase italic opacity-40">
                       <span>Link: github.com/{user?.username}/{repo.name}</span>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wrapped' && (
          <div className="flex flex-col items-center justify-center p-4 min-h-[80vh] animate-in zoom-in duration-500">
             <div ref={posterRef} className="relative max-w-md w-full aspect-[3/4] bg-black border-[12px] border-black shadow-[20px_20px_0px_white] p-8 flex flex-col justify-between overflow-hidden group">
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#FF6B00 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex justify-between items-start">
                   <div>
                      <div className="bg-[#FF6B00] text-white px-3 py-1 text-[10px] font-[900] uppercase italic border-2 border-black inline-block mb-2">Signal: 2026.03</div>
                      <h2 className="text-7xl font-[1000] text-white leading-[0.75] tracking-tighter uppercase italic">DEVPULSE<br/><span className="text-[#FFD600]">WRAPPED.</span></h2>
                   </div>
                   <Zap className="text-[#FFD600] fill-[#FFD600] w-12 h-12" strokeWidth={3} />
                </div>

                <div className="relative z-10 space-y-6">
                   <div className="space-y-1">
                      <div className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest italic">Primary Command Mood</div>
                      <div className="text-6xl font-[1000] text-white uppercase italic tracking-tighter glitch-text" style={{color: getVibeColor(m.avgSentiment)}}>{m.topMood}</div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <WrappedStat label="Active Signals" value={m.totalCommits} unit="Ingested" />
                      <WrappedStat label="Avg Vibe" value={`${m.avgSentiment}%`} unit="Positive" />
                      <WrappedStat label="Burnout Risk" value={`${m.avgBurnout}%`} unit="Danger" />
                      <WrappedStat label="Cognitive" value={m.cognitiveLoad} unit="Normalized" />
                   </div>
                </div>

                <div className="relative z-10 p-6 bg-[#FFD600] border-[6px] border-black rotate-[-2deg] shadow-[8px_8px_0px_#FF6B00]">
                   <div className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1 italic">Directive from Central Intelligence:</div>
                   <div className="text-lg font-[1000] text-black uppercase italic leading-tight leading-none tracking-tighter">{m.executiveDirective}</div>
                </div>

                <div className="absolute bottom-4 left-8 text-white/20 text-[60px] font-[1000] italic uppercase select-none pointer-events-none -z-0">ALL SIGNAL</div>
             </div>
             
             <div className="mt-10 flex flex-col md:flex-row gap-4">
                <button 
                  onClick={downloadPoster}
                  className="bg-black text-white px-8 py-4 border-4 border-black font-black uppercase italic hover:bg-white hover:text-black transition-all flex items-center gap-2 shadow-[8px_8px_0px_#FFD600]"
                >
                  <Download size={20} /> Export Signal Poster
                </button>
                <button 
                  onClick={downloadReport}
                  className="bg-[#FF6B00] text-white px-8 py-4 border-4 border-black font-black uppercase italic hover:bg-black transition-all flex items-center gap-2 shadow-[8px_8px_0px_black]"
                >
                  <BarChart size={20} /> Compile Intelligence Report
                </button>
             </div>

             {/* Hidden Intelligence Report Matrix (Pre-render for capture) */}
             <div className="fixed overflow-hidden h-1 w-1 opacity-0 pointer-events-none">
                <div ref={reportRef} className="w-[1200px] bg-white p-20 flex flex-col gap-10 font-['Outfit']">
                   <div className="flex justify-between items-end border-b-[20px] border-black pb-10">
                      <div>
                         <h1 className="text-9xl font-[1000] tracking-tighter italic uppercase leading-none">INTEL_REPORT</h1>
                         <div className="text-3xl font-black uppercase tracking-[0.2em] text-[#FF6B00]">OPERATIONAL_SUMMARY_MATRIX</div>
                      </div>
                      <div className="text-right">
                         <div className="text-xl font-bold uppercase opacity-40">System: DEVPULSE_OS_v1.0</div>
                         <div className="text-xl font-bold uppercase opacity-40">Extraction: {new Date().toLocaleDateString()}</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-10">
                      <div className="bg-black text-white p-10 border-[10px] border-black">
                         <div className="text-xl font-black uppercase tracking-widest text-[#FF6B00] mb-4 italic">Command Stability</div>
                         <div className="text-8xl font-[1000] italic leading-none mb-4">{m.signalStability}</div>
                         <p className="text-sm font-bold opacity-60 uppercase">System indicates consistent output cycles with minimal friction drift.</p>
                      </div>
                      <div className="bg-[#FFD600] text-black p-10 border-[10px] border-black">
                         <div className="text-xl font-black uppercase tracking-widest mb-4 italic">Cognitive Intensity</div>
                         <div className="text-8xl font-[1000] italic leading-none mb-4">{m.cognitiveLoad}</div>
                         <p className="text-sm font-bold opacity-60 uppercase">Load is currently within optimized safety parameters for deep-work cycles.</p>
                      </div>
                      <div className="bg-white text-black p-10 border-[10px] border-black">
                         <div className="text-xl font-black uppercase tracking-widest text-[#FF6B00] mb-4 italic">Emotional Resonance</div>
                         <div className="text-8xl font-[1000] italic leading-none mb-4">{m.emotionalResonance}</div>
                         <p className="text-sm font-bold opacity-60 uppercase">Signal tone matches primary directive: {m.topMood}.</p>
                      </div>
                   </div>

                   <div className="p-10 border-[10px] border-black bg-black text-white relative">
                      <div className="absolute top-10 right-10 text-[#FF6B00] opacity-20"><Zap size={120} /></div>
                      <div className="text-2xl font-[1000] text-[#FF6B00] uppercase italic tracking-[0.3em] mb-4">Executive Directive Matrix</div>
                      <div className="text-5xl font-[1000] italic uppercase leading-snug underline decoration-[#FF6B00] decoration-8">{m.executiveDirective}</div>
                   </div>

                   <div className="grid grid-cols-4 gap-6">
                      <div className="border-4 border-black p-6">
                         <div className="text-xs font-black uppercase opacity-40 mb-2 italic">Total Signals</div>
                         <div className="text-4xl font-black italic">{m.totalCommits}</div>
                      </div>
                      <div className="border-4 border-black p-6">
                         <div className="text-xs font-black uppercase opacity-40 mb-2 italic">Burnout Bias</div>
                         <div className="text-4xl font-black italic">{m.avgBurnout}%</div>
                      </div>
                      <div className="border-4 border-black p-6">
                         <div className="text-xs font-black uppercase opacity-40 mb-2 italic">Peak Activity Matrix</div>
                         <div className="text-4xl font-black italic uppercase">{m.peakDay}</div>
                      </div>
                      <div className="border-4 border-black p-6">
                         <div className="text-xs font-black uppercase opacity-40 mb-2 italic">Session Precision</div>
                         <div className="text-4xl font-black italic">{m.linguisticPrecision}</div>
                      </div>
                   </div>

                   <div className="mt-10 pt-10 border-t-[10px] border-black flex justify-between font-black italic text-xl">
                      <div>© 2026 DEVPULSE_PLATFORM_INTELLIGENCE // ZERO_FLUFF</div>
                      <div className="text-[#FF6B00]">AUTHENTICATED_SIGNAL_ENCODING: {Math.random().toString(36).substring(7).toUpperCase()}</div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="bg-white border-[6px] border-black p-8 shadow-[15px_15px_0px_0px_#000]">
              <h2 className="text-3xl font-[900] uppercase italic mb-8 border-b-4 border-black pb-3 flex items-center gap-3">
                <Settings size={32} className="text-[#FF6B00]" /> Operational Config
              </h2>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[9px] font-[900] uppercase tracking-widest opacity-60 italic">AI Inference Precision</label>
                    <div className="grid grid-cols-2 border-4 border-black overflow-hidden">
                       <button 
                         onClick={() => setConfig(prev => ({ ...prev, precision: 'standard' }))}
                         className={`p-3 font-[900] uppercase italic text-xs transition-colors ${config.precision === 'standard' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                       >
                         Standard Sys
                       </button>
                       <button 
                         onClick={() => setConfig(prev => ({ ...prev, precision: 'high' }))}
                         className={`p-3 font-[900] uppercase italic border-l-4 border-black transition-colors text-[10px] ${config.precision === 'high' ? 'bg-[#FFD600] text-black' : 'bg-white text-black hover:bg-[#FFD600]/20'}`}
                       >
                         High Res (PRO)
                       </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-[900] uppercase tracking-widest opacity-60 italic">Visual Density</label>
                    <div className="flex gap-3">
                       {['L', 'M', 'S'].map((d) => (
                         <button 
                           key={d}
                           onClick={() => setConfig(prev => ({ ...prev, density: d }))}
                           className={`flex-1 p-4 font-[900] text-xl border-4 border-black transition-all ${config.density === d ? 'bg-black text-white shadow-[4px_4px_0px_#FF6B00]' : 'bg-white text-black hover:bg-[#FFD600]'}`}
                         >
                           {d}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t-4 border-black space-y-4">
                    <button 
                      onClick={() => {
                        notify('TRANSMITTING_SYSTEM_PARAMETERS...', 'info');
                        setTimeout(() => {
                           localStorage.setItem('devpulse_config', JSON.stringify(config));
                           notify('CONFIG_SYNCED_AND_HARDENED.', 'success');
                        }, 800);
                      }}
                      className="w-full bg-black text-[#FFD600] py-4 text-xl font-[900] uppercase italic border-4 border-black hover:bg-[#FF6B00] hover:text-white transition-all mb-4"
                    >
                      Apply Signal Transform
                    </button>

                    <div className="flex items-center gap-2 p-3 bg-red-100 border-2 border-[#F87171] text-[#F87171] font-bold text-[9px] uppercase italic">
                       <Shield size={16} /> Danger: Irreversible Operation Matrix Detected
                    </div>
                    <button 
                      onClick={handleReset}
                      className="w-full bg-[#F87171] text-white py-4 text-xl font-[900] uppercase italic border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:bg-black transition-all"
                    >
                      Factory Reset Signal
                    </button>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-black text-[#FFD600] p-6 border-[6px] border-black shadow-[10px_10px_0px_0px_#FF6B00]">
                  <div className="text-[9px] font-black uppercase opacity-60 mb-1.5">System Memory</div>
                  <div className="text-3xl font-[900] italic">99.8% Clear</div>
               </div>
               <div className="bg-white p-6 border-[6px] border-black shadow-[10px_10px_0px_0px_#000]">
                  <div className="text-[9px] font-black uppercase opacity-60 mb-1.5">Latency Sync</div>
                  <div className="text-3xl font-[900] italic">12ms Response</div>
               </div>
            </div>
          </div>
        )}
        <div className="py-12"></div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`p-4 flex items-center gap-3 border-[4px] border-black font-[900] uppercase italic tracking-tighter cursor-pointer text-sm transition-all ${
    active ? 'bg-[#FFD600] text-black translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(255,107,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
  }`}>
    {icon} {label}
  </div>
);

const StatBox = ({ label, value, desc, color, textColor = 'black', statusColor }) => (
  <div style={{ backgroundColor: color, color: textColor }} className="p-6 border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
    {statusColor && <div style={{ backgroundColor: statusColor }} className="absolute h-full w-2 left-0 top-0"></div>}
    <div className="text-[10px] font-[900] uppercase opacity-40 italic mb-1 tracking-[0.1em]">{label}</div>
    <div className="text-3xl font-[900] tracking-tighter uppercase italic leading-none mb-2">{value}</div>
    <div className="text-[9px] font-bold opacity-60 leading-tight border-t border-black/10 pt-2">{desc}</div>
  </div>
);

const WrappedBox = ({ label, value, sub, color, bg = 'white' }) => (
  <div className="p-8 border-[10px] border-black shadow-[10px_10px_0px_#000] relative group" style={{ backgroundColor: bg }}>
    <div className="text-[11px] font-[1000] uppercase text-black/40 tracking-widest mb-2 whitespace-nowrap">{label}</div>
    <div className="text-4xl font-[1000] italic uppercase tracking-tighter mb-2" style={{ color: color }}>{value}</div>
    <div className="text-[10px] font-[1000] uppercase opacity-20 group-hover:opacity-100 transition-opacity">{sub}</div>
  </div>
);

const HealthBar = ({ label, value, color, bg }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-black uppercase text-white/60 italic">
      <span>{label}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-4 w-full border-2 border-white/20 p-[2px]" style={{ backgroundColor: bg }}>
      <div 
        className="h-full transition-all duration-1000" 
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

const WrappedStat = ({ label, value, unit }) => (
  <div className="border-l-4 border-[#FF6B00] pl-3 py-1">
    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{label}</div>
    <div className="text-2xl font-[1000] text-white italic tracking-tighter leading-none">{value}</div>
    <div className="text-[8px] font-black text-[#FF6B00] uppercase italic mt-0.5">{unit}</div>
  </div>
);

export default Dashboard;
