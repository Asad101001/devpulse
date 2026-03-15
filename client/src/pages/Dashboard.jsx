import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';
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
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../services/api.js';

const mockData = [
  { name: 'M', score: 65 },
  { name: 'T', score: 80 },
  { name: 'W', score: 45 },
  { name: 'T', score: 90 },
  { name: 'F', score: 70 },
  { name: 'S', score: 55 },
  { name: 'S', score: 85 },
];

const Dashboard = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [stats, setStats] = React.useState(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('summary');
  const [showWrappedModal, setShowWrappedModal] = React.useState(false);

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
        <div className="bg-[#FF6B00] p-6 border-[6px] border-white text-white font-[900] text-xl animate-pulse">
          INITIALIZING_DASHBOARD...
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
      <aside className="w-full md:w-64 bg-black text-white border-r-[8px] border-black flex flex-col sticky top-0 md:h-screen z-20">
        <div className="p-6 border-b-[8px] border-white flex items-center gap-4 bg-[#FF6B00]">
          <Zap className="text-white w-8 h-8" strokeWidth={3} />
          <span className="text-2xl font-black tracking-tighter uppercase italic">Pulse.IO</span>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Summary" active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
          <SidebarItem icon={<Github size={20}/>} label="Repos" active={activeTab === 'repos'} onClick={() => setActiveTab('repos')} />
          <SidebarItem icon={<Settings size={20}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-6 border-t-[8px] border-white space-y-4">
          <button onClick={logout} className="w-full bg-white text-black p-3 border-4 border-black font-black uppercase flex items-center justify-center gap-2 hover:bg-[#F87171] transition-all shadow-[4px_4px_0px_0px_#FFD600]">
            <LogOut size={18} /> Kill_Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#FFD600] border-l-[8px] border-black p-4 md:p-8 space-y-8 overflow-y-auto h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[8px] border-black pb-8">
          <div>
            <div className="inline-block bg-black text-white px-3 py-1 font-black uppercase tracking-widest text-[10px] mb-4">
              SYNC_STATUS: {isSyncing ? 'ACTIVE_SCAN' : 'READY'} // LAST: {new Date(stats.lastSyncedAt).toLocaleTimeString()}
            </div>
            <h1 className="text-5xl font-black text-black tracking-tighter leading-none italic uppercase">
              {activeTab === 'summary' ? 'Operational_Feed.' : activeTab === 'repos' ? 'Repository.SYS' : 'Global_Config.'}
            </h1>
          </div>
          {activeTab === 'summary' && (
            <button onClick={handleSync} disabled={isSyncing} className={`bg-black text-white px-6 py-3 text-lg font-black uppercase italic border-[4px] border-black flex items-center gap-3 transition-all shadow-[8px_8px_0px_0px_#FF6B00] ${isSyncing ? 'opacity-50' : 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}>
              <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Syncing...' : 'Force_Sync'}
            </button>
          )}
        </div>

        {activeTab === 'summary' && (
          <div className="space-y-10">
            {/* Real Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatBox label="Flow_Sentiment" value={`${m.avgSentiment}%`} color="white" statusColor={getVibeColor(m.avgSentiment)} />
              <StatBox label="Resonance" value={m.emotionalResonance} color="white" />
              <StatBox label="Burnout_Risk" value={`${m.avgBurnout}%`} color="white" statusColor={getBurnoutColor(m.avgBurnout)} />
              <StatBox label="Active_Signals" value={m.totalCommits} color="black" textColor="white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* AI Showroom */}
              <div className="lg:col-span-8 bg-white border-[8px] border-black p-8 shadow-[15px_15px_0px_0px_#000]">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 border-b-6 border-black pb-4 flex items-center gap-4">
                  <Cpu className="text-[#FF6B00]" size={32} />
                  AI_Command_Insights
                </h2>
                <div className="space-y-4">
                  {stats.recentCommits?.map((commit, idx) => (
                    <div key={idx} className="p-4 border-4 border-black bg-white group hover:bg-black hover:text-white transition-all cursor-default relative overflow-hidden">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase bg-[#FFD600] text-black px-2 py-0.5 border-2 border-black inline-block">{commit.repoId?.name}</span>
                          <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">{new Date(commit.timestamp).toLocaleDateString()}</span>
                       </div>
                       <div className="text-xl font-black uppercase italic tracking-tight mb-3">"{commit.message}"</div>
                       <div className="p-3 bg-[#FFD600]/10 border-l-4 border-[#FF6B00] text-sm font-bold leading-snug group-hover:bg-[#FF6B00]/20">
                          <span className="text-[#FF6B00] group-hover:text-[#FFD600]">SYSTEM_BRIEF:</span> {commit.aiSummary || 'Analysis_Pending_Refinement...'}
                       </div>
                       <div className="absolute right-[-20px] bottom-[-20px] opacity-5 group-hover:opacity-20 transition-opacity">
                          <BarChart size={120} />
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wrapped Section */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#FF6B00] text-white p-8 border-[8px] border-black shadow-[15px_15px_0px_0px_#000] relative">
                  <h3 className="text-3xl font-black uppercase italic mb-6 border-b-4 border-white pb-2">Dev_Wrapped</h3>
                  <div className="space-y-4 font-black uppercase italic">
                      <div className="p-4 bg-black border-[4px] border-white">
                        <div className="text-[10px] opacity-60 mb-1">Peak_Mood</div>
                        <div className="text-4xl" style={{color: getVibeColor(m.avgSentiment)}}>{m.topMood}</div>
                      </div>
                      <button 
                        onClick={() => setShowWrappedModal(true)}
                        className="w-full bg-white text-black py-4 border-4 border-black font-black uppercase flex items-center justify-center gap-3 hover:bg-[#FFD600] shadow-[6px_6px_0px_0px_#000]"
                      >
                        <ImageIcon size={20} /> Generate_Poster
                      </button>
                  </div>
                </div>

                <div className="bg-white p-6 border-[6px] border-black space-y-4">
                   <h4 className="text-xl font-black uppercase flex items-center gap-2">
                      <Shield size={20} /> Integrity_Report
                   </h4>
                   <p className="text-xs font-bold opacity-60 leading-tight">
                      ALL_DATA_ANALYZED_LOCALLY_VIA_GROQ_LLM. ZERO_PERSISTENCE_ON_THIRD_PARTY_SERVERS.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Wrapped Snapshot */}
        {showWrappedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
             <div className="bg-[#FFD600] border-[10px] border-black p-12 max-w-2xl w-full shadow-[30px_30px_0px_0px_#FF6B00] relative scale-in-center">
                <button onClick={() => setShowWrappedModal(false)} className="absolute top-4 right-4 bg-black text-white p-2">
                   <X size={32} />
                </button>
                <div className="space-y-12">
                   <div className="border-b-8 border-black pb-8 flex justify-between items-end">
                      <h2 className="text-7xl font-[1000] uppercase italic tracking-tighter leading-none">PULSE <br /> WRAPPED.</h2>
                      <div className="text-right">
                         <div className="font-black italic uppercase">OPERATIONAL_PERIOD</div>
                         <div className="text-2xl font-[1000]">MARCH_2026</div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-2">
                         <div className="font-black uppercase text-xs opacity-50">Dominant_Signal</div>
                         <div className="text-5xl font-black italic uppercase">{m.topMood}</div>
                      </div>
                      <div className="space-y-2">
                         <div className="font-black uppercase text-xs opacity-50">Cognitive_Resilience</div>
                         <div className="text-5xl font-black italic uppercase">{100 - m.avgBurnout}%</div>
                      </div>
                   </div>
                   <div className="p-8 bg-black text-white border-8 border-white font-[1000] text-3xl italic uppercase text-center">
                      "{m.topMood === 'Happy' ? 'FLOW_STATE_DETECTION_POSITIVE' : 'SYSTEM_RECOVERY_REQUIRED'}"
                   </div>
                   <div className="flex justify-between items-center pt-8 border-t-8 border-black font-black uppercase text-sm">
                      <span>DEV_PULSE_REPORT_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                      <button className="bg-black text-white px-6 py-3 border-4 border-black flex items-center gap-3">
                         <Download size={18} /> SAVE_RAW_POSTER
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'repos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.repoList?.map((repo, idx) => (
              <div key={idx} className="bg-white border-[6px] border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
                  <Github size={32} className="mb-4 text-[#FF6B00]" />
                  <h3 className="text-2xl font-black uppercase italic mb-2 truncate">{repo.name}</h3>
                  <div className="text-[10px] font-black uppercase bg-[#FFD600] px-2 py-1 border-2 border-black inline-block mb-4">{repo.language || 'DATA'}</div>
                  <p className="text-sm font-bold opacity-60 line-clamp-2 h-10">{repo.description || 'NO_METADATA_AVAILABLE'}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto bg-white border-[8px] border-black p-8 shadow-[15px_15px_0px_0px_#000]">
            <h2 className="text-4xl font-black uppercase italic mb-8 border-b-6 border-black pb-4">Operational_Config</h2>
            <div className="space-y-8">
               <div className="p-4 border-4 border-black bg-[#FFD600] flex justify-between items-center">
                  <span className="font-black uppercase italic">AI_Inference_Depth</span>
                  <select className="bg-black text-white p-2 font-black border-2 border-white">
                     <option>Standard</option>
                     <option>High_Precision</option>
                  </select>
               </div>
               <div className="p-4 border-4 border-black flex justify-between items-center">
                  <span className="font-black uppercase italic">Dashboard_Density</span>
                  <div className="flex gap-2">
                     <button className="bg-black text-white px-4 py-1 font-black">L</button>
                     <button className="bg-[#FFD600] px-4 py-1 font-black border-2 border-black">M</button>
                     <button className="bg-white px-4 py-1 font-black border-2 border-black">S</button>
                  </div>
               </div>
               <button className="w-full bg-[#F87171] text-white py-4 text-xl font-black uppercase italic border-4 border-black shadow-[6px_6px_0px_0px_#000]">Factory_Reset_Signal</button>
            </div>
          </div>
        )}
        <div className="py-12"></div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`p-4 flex items-center gap-3 border-[4px] border-black font-[900] uppercase italic tracking-tighter cursor-pointer transition-all ${
    active ? 'bg-[#FFD600] text-black translate-x-1 translate-y-1 shadow-none' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(255,107,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
  }`}>
    {icon} {label}
  </div>
);

const StatBox = ({ label, value, color, textColor = 'black', statusColor }) => (
  <div style={{ backgroundColor: color, color: textColor }} className="p-6 border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
    {statusColor && <div style={{ backgroundColor: statusColor }} className="absolute h-full w-2 left-0 top-0"></div>}
    <div className="text-[10px] font-[1000] uppercase opacity-50 italic mb-1">{label}</div>
    <div className="text-4xl font-[1000] tracking-tighter uppercase italic leading-none">{value}</div>
    <ArrowUpRight size={24} className="absolute bottom-2 right-2 opacity-10 group-hover:opacity-100 transition-opacity" />
  </div>
);

export default Dashboard;
