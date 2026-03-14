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
  LayoutDashboard
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

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/data/stats');
      setStats(data.data);
      if (data.data.syncStatus === 'syncing') {
          setIsSyncing(true);
      } else {
          setIsSyncing(false);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err.message);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Poll for status if syncing
  React.useEffect(() => {
    let interval;
    if (isSyncing) {
        interval = setInterval(fetchStats, 3000);
    }
    return () => clearInterval(interval);
  }, [isSyncing]);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await api.post('/data/sync');
      // Status will be updated by polling
    } catch (err) {
      console.error('Sync failed:', err.message);
      setIsSyncing(false);
    }
  };

  if (loading || (isAuthenticated && !stats)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="bg-[#FF6B00] p-10 border-[10px] border-white text-white font-[900] text-3xl animate-pulse">
          INITIALIZING_DASHBOARD...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Outfit'] flex flex-col md:flex-row">
      {/* Brutal Sidebar */}
      <aside className="w-full md:w-80 bg-black text-white border-r-[8px] border-black flex flex-col">
        <div className="p-8 border-b-[8px] border-white flex items-center gap-4 bg-[#FF6B00]">
          <Zap className="text-white w-10 h-10" strokeWidth={3} />
          <span className="text-3xl font-black tracking-tighter uppercase italic">Pulse.IO</span>
        </div>

        <nav className="flex-1 p-6 space-y-4">
          <SidebarItem icon={<LayoutDashboard />} label="Summary" active />
          <SidebarItem icon={<Activity />} label="Vibe_Check" />
          <SidebarItem icon={<Github />} label="Repos" />
          <SidebarItem icon={<Settings />} label="Config" />
        </nav>

        <div className="p-8 border-t-[8px] border-white space-y-6">
          <div className="bg-[#FFD600] text-black p-4 border-4 border-white font-black uppercase text-xs">
            Tier: Free_User
          </div>
          <button 
            onClick={logout}
            className="w-full bg-white text-black p-4 border-4 border-black font-black uppercase flex items-center justify-center gap-2 hover:bg-[#FF6B00] hover:text-white transition-all"
          >
            <LogOut size={20} />
            Kill_Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#FFD600] border-l-[8px] border-black p-8 md:p-16 space-y-12 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-[8px] border-black pb-12">
          <div>
            <div className="inline-block bg-black text-white px-4 py-2 font-black uppercase tracking-widest text-sm mb-6">
              Authenticated: {user?.username}
            </div>
            <h1 className="text-8xl font-black text-black tracking-tighter leading-none italic uppercase">
              Operational <br /> <span className="underline decoration-[10px]">Dashboard.</span>
            </h1>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`bg-black text-white px-10 py-6 text-2xl font-black uppercase italic border-[6px] border-black flex items-center gap-4 transition-all shadow-[10px_10px_0px_0px_#FF6B00] ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black hover:shadow-none hover:translate-x-1 hover:translate-y-1'}`}
          >
            <RefreshCw size={28} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Force_Sync'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatBox label="Average_Vibe" value={`${stats?.avgSentiment || 0}%`} color="white" />
          <StatBox label="Top_Mood" value={stats?.topMood || 'N/A'} color="#FF6B00" textColor="white" />
          <StatBox label="Burnout_Level" value={`${stats?.avgBurnout || 0}%`} color="black" textColor="white" />
        </div>

        {/* Analytic Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Box */}
          <div className="lg:col-span-8 bg-white border-[8px] border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10 border-b-4 border-black pb-4 flex justify-between">
              Sentiment_Timeline
              <ArrowUpRight size={32} />
            </h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData || mockData}>
                  <CartesianGrid strokeDasharray="0" stroke="#000000" vertical={false} strokeWidth={2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{strokeWidth: 4, stroke: '#000'}} 
                    tickLine={false}
                    tick={{fill: '#000', fontWeight: 900, fontSize: 14}}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#FFD600', opacity: 0.5}}
                    contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '0px', color: '#fff', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="score" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#FF6B00] text-white p-10 border-[8px] border-black shadow-[15px_15px_0px_0px_#000]">
               <h3 className="text-3xl font-black uppercase italic mb-6">Dev_Wrapped</h3>
               <div className="space-y-6 font-black uppercase italic leading-none">
                  <div className="p-4 bg-black border-2 border-white">
                    <div className="text-[10px] opacity-60 mb-1">Weekly_Total</div>
                    <div className="text-3xl">{stats?.commitCount || 0}_Commits</div>
                  </div>
                  <div className="p-4 bg-white text-black border-2 border-black">
                    <div className="text-[10px] opacity-60 mb-1">Dominant_Vibe</div>
                    <div className="text-3xl">{stats?.topMood || 'IDLE'}</div>
                  </div>
               </div>
               <p className="font-bold text-xs leading-relaxed mt-10 opacity-70">
                 PROCESSED_DATA_INDICATES_YOUR_PEAK_PRODUCTIVITY_IS_DURING_AFTER_HOURS. WATCH_BURNOUT_VECTORS.
               </p>
            </div>

            <div className="bg-white text-black p-8 border-[6px] border-black">
               <h4 className="text-xl font-black uppercase mb-4">Monday_Briefing</h4>
               <p className="font-bold text-sm leading-relaxed mb-6 italic opacity-70">"Session data indicates a consistency in commit positivity. Maintain current flow state harmonics."</p>
               <button className="w-full border-4 border-black p-3 font-black uppercase text-xs hover:bg-black hover:text-white transition-all">Download_Report</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }) => (
  <div className={`p-5 flex items-center gap-4 border-[4px] border-black font-[900] uppercase italic tracking-tighter cursor-pointer transition-all ${
    active ? 'bg-[#FFD600] text-black translate-x-1 translate-y-1 shadow-none' : 'bg-white text-black shadow-[6px_6px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
  }`}>
    {icon}
    {label}
  </div>
);

const StatBox = ({ label, value, color, textColor = 'black' }) => (
  <div style={{ backgroundColor: color, color: textColor }} className="p-8 border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2">
    <div className="text-xs font-black uppercase opacity-60 italic">{label}</div>
    <div className="text-5xl font-black tracking-tighter uppercase italic leading-none">{value}</div>
  </div>
);

export default Dashboard;
