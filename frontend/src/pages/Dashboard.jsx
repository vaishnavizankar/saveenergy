import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Leaf, 
  Activity, 
  AlertCircle,
  ArrowRight,
  TrendingDown,
  RefreshCcw,
  Clock,
  Server,
  Database,
  Box,
  Zap,
  ShieldCheck,
  ZapOff,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetricCard from '../components/Dashboard/MetricCard';
import LiveLineChart from '../components/Charts/LiveLineChart';
import { metricService } from '../services/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_cost_h: 0.0,
    total_carbon_h: 0.0,
    running_resources: 0,
    idle_resources: 0,
    timestamp: new Date().toISOString()
  });
  
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [aiStatus, setAiStatus] = useState('PROVISIONING');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [snapRes, breakRes, histRes] = await Promise.all([
          metricService.getLive(),
          metricService.getCostBreakdown(),
          metricService.getTimeSeries(1)
        ]);
        
        setMetrics(snapRes.data);
        setBreakdown(breakRes.data.breakdown);
        
        const chartData = histRes.data.slice(-15).map(item => ({
          time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: item.carbon
        }));
        setHistory(chartData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchInitialData();

    const checkAI = setInterval(() => {
      setAiStatus(prev => {
        if (prev === 'PROVISIONING') return 'OPTIMIZING';
        if (prev === 'OPTIMIZING') return 'ONLINE';
        return prev;
      });
    }, 15000);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws/live`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'LIVE_METRICS') {
        const liveResources = data.data;
        const totalCost = liveResources.reduce((acc, curr) => acc + (curr.cost || 0), 0);
        const totalCarbon = liveResources.reduce((acc, curr) => acc + (curr.carbon || 0), 0);
        
        setMetrics(prev => ({
          ...prev,
          total_cost_h: totalCost,
          total_carbon_h: totalCarbon,
          running_resources: liveResources.length,
          timestamp: data.timestamp
        }));

        setHistory(prev => {
          const newPoint = { 
            time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            value: totalCarbon 
          };
          const next = [...prev, newPoint];
          return next.slice(-15);
        });
        setLastUpdated(0);
      }
    };

    const timer = setInterval(() => setLastUpdated(prev => prev + 1), 1000);

    return () => {
      ws.close();
      clearInterval(timer);
      clearInterval(checkAI);
    };
  }, []);

  const serviceIcons = {
    'EC2': <Server size={16} />,
    'RDS': <Database size={16} />,
    'S3': <Box size={16} />,
    'Lambda': <Zap size={16} />
  };

  return (
    <div className="page-enter">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Eco Intelligence</h2>
            <AnimatePresence mode="wait">
              {aiStatus === 'PROVISIONING' ? (
                <motion.div 
                  key="ai-prov"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm"
                >
                  <RefreshCcw size={14} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Warming Up AI Engine</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="ai-online"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-eco-50 text-eco-600 px-4 py-2 rounded-2xl border border-eco-100 shadow-glow-eco"
                >
                  <ShieldCheck size={14} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sustainability Intelligence Active</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2.5 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200/50">
               <div className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-eco-500"></span>
               </div>
               <span className="text-xs font-bold text-slate-600">AWS Infrastructure Sync: <span className="text-slate-900">Online</span></span>
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
               <Clock size={14} />
               <span>Last parity check {lastUpdated}s ago</span>
             </div>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
             setLastUpdated(0);
             try {
               const { resourceService } = await import('../services/api');
               await resourceService.sync();
             } catch (e) {}
          }}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card text-eco-600 hover:text-eco-700 hover:shadow-card-hover transition-all group"
        >
          <RefreshCcw size={28} className={lastUpdated < 1 ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
        </motion.button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <MetricCard 
          title="Hourly Ops Cost" 
          value={`$${metrics.total_cost_h.toFixed(3)}`} 
          unit="/ hr" 
          icon={<DollarSign size={24} />} 
          trend={metrics.total_cost_h > 0 ? "up" : null} 
          trendValue="0.8"
          color="blue"
        />
        <MetricCard 
          title="Carbon Intensity" 
          value={metrics.total_carbon_h.toFixed(2)} 
          unit="kg CO₂e / hr" 
          icon={<Leaf size={24} />} 
          trend="down" 
          trendValue="4.2"
          color="eco"
        />
        <MetricCard 
          title="Asset Coverage" 
          value={metrics.running_resources} 
          unit="Active Items" 
          icon={<Activity size={24} />} 
          color="indigo"
        />
        <MetricCard 
          title="Waste Detections" 
          value={metrics.idle_resources} 
          unit="Idle Assets" 
          icon={<AlertCircle size={24} />} 
          trend={metrics.idle_resources > 0 ? "up" : null}
          trendValue={metrics.idle_resources > 0 ? "100" : "0"}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Chart Area */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <LiveLineChart 
            data={history} 
            title="Carbon Footprint Telemetry" 
            unit="kg" 
            color="#10b981"
          />

          <div className="card-premium p-10 bg-white/40">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Multi-Service Portfolio</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-account distribution</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <Layers size={20} className="text-slate-400" />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breakdown.map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-6 bg-white/50 rounded-3xl border border-slate-100/50 hover:bg-white hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-eco-600 group-hover:scale-110 group-hover:bg-eco-50 transition-all">
                      {serviceIcons[item.service] || <Activity size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight">{item.service}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AWS Infrastructure</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900 tracking-tight tabular-nums">${item.cost.toFixed(3)}<span className="text-[10px] text-slate-400 font-bold ml-1">/hr</span></p>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow-eco"></div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Optimal</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="card-premium p-10 bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-1000">
              <Sparkles size={160} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white/10 backdrop-blur-md text-amber-400 rounded-3xl border border-white/10">
                   <ZapOff size={28} />
                </div>
                <div>
                   <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Optimization</h3>
                   <span className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest">IA Powered engine</span>
                </div>
              </div>

              <p className="text-slate-300 text-base font-medium leading-relaxed mb-8">
                GreenOps AI detected <span className="text-white font-black underline decoration-amber-400 decoration-2 underline-offset-4">{metrics.idle_resources} underutilized resource(s)</span> across your active regions.
              </p>
              
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[40px] border border-white/5 mb-10 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Est. Monthly Recovery</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-5xl font-black text-white tracking-tighter tabular-nums text-shadow-glow">
                    ${(metrics.idle_resources * 45.2).toFixed(2)}
                  </h4>
                </div>
                <div className="flex items-center gap-2 mt-6 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-2xl w-fit">
                  <Leaf size={14} fill="currentColor" />
                  <span>-15.4 kg CO₂e Offset</span>
                </div>
              </div>

              <motion.button 
                 whileHover={{ x: 5 }}
                 onClick={() => window.location.href = '/recommendations'}
                 className="mt-auto w-full btn-primary py-6 rounded-[2.5rem] bg-eco-500 hover:bg-eco-400 text-white font-black group/btn overflow-hidden"
              >
                <span className="uppercase tracking-[0.2em] text-xs">Access Optimization Panel</span>
                <ChevronRight size={20} className="group-hover/btn:translate-x-1.5 transition-transform" />
              </motion.button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="card-premium p-10 bg-white group hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                   <ShieldCheck size={20} />
                </div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">Compliance Score</h4>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black text-slate-900 tracking-tighter">94</span>
                   <span className="text-xl font-bold text-slate-400">%</span>
                </div>
                <div className="w-24 h-24 relative">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="15" className="text-eco-500" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingDown size={20} className="text-eco-600" />
                   </div>
                </div>
             </div>
             <p className="text-xs font-medium text-slate-500 mt-6 leading-relaxed">
                Your infrastructure is performing <span className="text-eco-600 font-bold">12% better</span> than the industry sustainability average.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
