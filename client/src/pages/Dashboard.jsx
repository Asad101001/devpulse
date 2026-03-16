import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api.js';
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

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/data/stats');
      setStats(data.data);
      setIsSyncing(data.data.syncStatus === 'syncing');
    } catch (err) {
      console.error('Failed to fetch stats:', err.message);
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
    <div className="min-h-screen bg-white text-black font-['Outfit'] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-black text-white border-r-[6px] border-black flex flex-col sticky top-0 md:h-screen z-20">
        <div className="p-5 border-b-[6px] border-white flex items-center gap-3 bg-[#FF6B00]">
          <Zap className="text-white w-6 h-6" strokeWidth={3} />
          <span className="text-xl font-[900] tracking-tighter uppercase italic">Pulse IO</span>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={18}/>} label="Operational Feed" active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
          <SidebarItem icon={<Github size={18}/>} label="Repository Stats" active={activeTab === 'repos'} onClick={() => setActiveTab('repos')} />
          <SidebarItem icon={<Settings size={18}/>} label="System Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-5 border-t-[6px] border-white space-y-3">
          <button onClick={logout} className="w-full bg-white text-black p-2.5 border-4 border-black font-[900] uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#F87171] transition-all shadow-[4px_4px_0px_0px_#FFD600]">
            <LogOut size={16} /> End Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#FFD600] border-l-[6px] border-black p-4 md:p-6 space-y-6 overflow-y-auto h-screen selection:bg-black selection:text-[#FFD600]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-[6px] border-black pb-6">
          <div>
            <div className="inline-block bg-black text-white px-2 py-0.5 font-black uppercase tracking-widest text-[9px] mb-3">
              Sync Status: {isSyncing ? 'Active Scanning' : 'Ready'} // Last: {new Date(stats.lastSyncedAt).toLocaleTimeString()}
            </div>
            <h1 className="text-4xl font-[900] text-black tracking-tighter leading-none italic uppercase">
              {activeTab === 'summary' ? 'Operational Feed.' : activeTab === 'repos' ? 'Repository Stats.' : 'System Settings.'}
            </h1>
          </div>
          {activeTab === 'summary' && (
            <button onClick={handleSync} disabled={isSyncing} className={`bg-black text-white px-6 py-3 text-lg font-[900] uppercase italic border-4 border-black flex items-center gap-2 transition-all shadow-[6px_6px_0px_0px_#FF6B00] ${isSyncing ? 'opacity-50' : 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}>
              <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Syncing...' : 'Force Sync'}
            </button>
          )}
        </div>

        {activeTab === 'summary' && (
          <div className="space-y-8">
            {/* Real Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatBox label="Flow Sentiment" value={`${m.avgSentiment}%`} color="white" statusColor={getVibeColor(m.avgSentiment)} />
              <StatBox label="Emot Resonance" value={m.emotionalResonance} color="white" />
              <StatBox label="Burnout Risk" value={`${m.avgBurnout}%`} color="white" statusColor={getBurnoutColor(m.avgBurnout)} />
              <StatBox label="Active Signals" value={m.totalCommits} color="black" textColor="white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* AI Showroom */}
              <div className="lg:col-span-8 flex flex-col gap-6">
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
                    {/* Radar Chart */}
                    <div className="bg-white border-[6px] border-black p-5 shadow-[8px_8px_0px_0px_#000]">
                        <h3 className="text-lg font-[900] uppercase italic mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                           <Activity size={18} className="text-[#FF6B00]" /> Operational Radar
                        </h3>
                        <div className="h-[240px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                 { subject: 'Intensity', A: m.avgSentiment, fullMark: 100 },
                                 { subject: 'Focus', A: 100 - m.avgBurnout, fullMark: 100 },
                                 { subject: 'Stability', A: parseInt(m.emotionalResonance), fullMark: 100 },
                                 { subject: 'Volume', A: Math.min(m.totalCommits * 2, 100), fullMark: 100 },
                                 { subject: 'Frequency', A: stats.heatmapData?.length || 50, fullMark: 100 },
                              ]}>
                                 <PolarGrid stroke="#000" strokeWidth={1} />
                                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 9, fontWeight: '900' }} />
                                 <Radar name="Metrics" dataKey="A" stroke="#000" strokeWidth={3} fill="#FF6B00" fillOpacity={0.8} />
                              </RadarChart>
                           </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Heatmap */}
                    <div className="bg-white border-[6px] border-black p-5 shadow-[8px_8px_0px_0px_#000]">
                        <h3 className="text-lg font-[900] uppercase italic mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                           <History size={18} className="text-[#FF6B00]" /> Signal Frequency
                        </h3>
                        <div className="grid grid-cols-10 gap-1.5 p-0.5 overflow-x-auto">
                           {Array.from({ length: 70 }).map((_, i) => {
                              const dateStr = new Date(Date.now() - (69-i) * 24*60*60*1000).toISOString().split('T')[0];
                              const hasData = stats.heatmapData?.some(d => d._id === dateStr);
                              return (
                                <div key={i} title={dateStr} className={`aspect-square w-full border-2 border-black transition-all ${hasData ? 'bg-black scale-105 shadow-[1px_1px_0px_#FF6B00]' : 'bg-white opacity-20'}`}></div>
                              );
                           })}
                        </div>
                        <div className="mt-4 text-[9px] font-[900] uppercase bg-[#FFD600] border-2 border-black p-1.5 text-center italic">
                           70 Cycle History Detected.
                        </div>
                    </div>
                </div>
              </div>

              {/* Wrapped Section */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#FF6B00] text-white p-6 border-[6px] border-black shadow-[10px_10px_0px_0px_#000] relative group">
                  <div className="absolute top-4 right-4 animate-pulse">
                    <Zap size={32} className="text-white fill-white" />
                  </div>
                  <h3 className="text-2xl font-[900] uppercase italic mb-8 border-b-4 border-white pb-2 underline decoration-[4px]">Dev Wrapped</h3>
                  <div className="space-y-4 font-[900] uppercase italic">
                      <div className="p-5 bg-black border-[4px] border-white shadow-[6px_6px_0px_#000]">
                        <div className="text-[9px] text-[#FFD600] mb-2 tracking-widest whitespace-nowrap">PEAK COGNITIVE MOOD</div>
                        <div className="text-4xl" style={{color: getVibeColor(m.avgSentiment)}}>{m.topMood}</div>
                      </div>
                      
                      <div className="p-3 bg-white text-black border-[2px] border-black font-bold text-[10px]">
                        SYSTEM STATUS: <span className="text-[#FF6B00]">SYNCED AND READY</span><br/>
                        IDENTITY: <span className="underline">{user?.username}</span>
                      </div>

                      <button 
                        onClick={() => setShowWrappedModal(true)}
                        className="w-full bg-white text-black py-5 border-4 border-black font-[900] text-xl uppercase flex items-center justify-center gap-3 hover:bg-[#FFD600] shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                      >
                        <ImageIcon size={28} /> GENERATE POSTER
                      </button>
                  </div>
                </div>

                <div className="bg-white p-5 border-[6px] border-black space-y-3 shadow-[8px_8px_0px_#000]">
                   <h4 className="text-xl font-[900] uppercase italic flex items-center gap-2 border-b-2 border-black pb-2">
                      <Shield size={20} className="text-[#FF6B00]" /> Integrity Report
                   </h4>
                   <p className="text-[10px] font-black leading-tight bg-[#FFD600]/20 p-3 border-2 border-black italic">
                      ALL DATA ANALYZED LOCALLY VIA GROQ LLM.<br/>ZERO PERSISTENCE ON THIRD PARTY SERVERS.
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
                       <ArrowUpRight size={20} className="opacity-20 group-hover:opacity-100" />
                    </div>
                    <h3 className="text-2xl font-[900] uppercase italic mb-3 truncate border-b-2 border-black pb-2">{repo.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                       <div className="text-[9px] font-[900] uppercase bg-[#FFD600] px-2 py-0.5 border-2 border-black">{repo.language || 'DATA'}</div>
                       <div className="text-[9px] font-[900] uppercase bg-black text-white px-2 py-0.5 border-2 border-black">{repo.visibility || 'PRIVATE'}</div>
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
                       <button className="bg-black text-white p-3 font-[900] uppercase italic text-xs">Standard Sys</button>
                       <button className="bg-[#FFD600] text-black p-3 font-[900] uppercase italic border-l-4 border-black hover:bg-white transition-colors text-[10px]">High Res (PRO)</button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-[900] uppercase tracking-widest opacity-60 italic">Visual Density</label>
                    <div className="flex gap-3">
                       <button className="flex-1 bg-black text-white p-4 font-[900] text-xl shadow-[4px_4px_0px_#FF6B00]">L</button>
                       <button className="flex-1 bg-[#FFD600] p-4 font-[900] text-xl border-4 border-black hover:bg-white transition-colors">M</button>
                       <button className="flex-1 bg-white p-4 font-[900] text-xl border-4 border-black hover:bg-[#FFD600] transition-colors">S</button>
                    </div>
                 </div>

                 <div className="pt-6 border-t-4 border-black space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-red-100 border-2 border-[#F87171] text-[#F87171] font-bold text-[9px] uppercase italic">
                       <Shield size={16} /> Danger: Irreversible Operation Matrix Detected
                    </div>
                    <button className="w-full bg-[#F87171] text-white py-4 text-xl font-[900] uppercase italic border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:bg-black transition-all">
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

const StatBox = ({ label, value, color, textColor = 'black', statusColor }) => (
  <div style={{ backgroundColor: color, color: textColor }} className="p-6 border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
    {statusColor && <div style={{ backgroundColor: statusColor }} className="absolute h-full w-2 left-0 top-0"></div>}
    <div className="text-[10px] font-[900] uppercase opacity-40 italic mb-1.5 tracking-[0.1em]">{label}</div>
    <div className="text-3xl font-[900] tracking-tighter uppercase italic leading-none">{value}</div>
    <ArrowUpRight size={24} className="absolute bottom-2 right-2 opacity-10 group-hover:opacity-100 group-hover:translate-x-[-2px] group-hover:translate-y-[2px] transition-all" />
  </div>
);

const WrappedBox = ({ label, value, sub, color, bg = 'white' }) => (
  <div className="p-8 border-[10px] border-black shadow-[10px_10px_0px_#000] relative group" style={{ backgroundColor: bg }}>
    <div className="text-[11px] font-[1000] uppercase text-black/40 tracking-widest mb-2 whitespace-nowrap">{label}</div>
    <div className="text-4xl font-[1000] italic uppercase tracking-tighter mb-2" style={{ color: color }}>{value}</div>
    <div className="text-[10px] font-[1000] uppercase opacity-20 group-hover:opacity-100 transition-opacity">{sub}</div>
  </div>
);

export default Dashboard;
