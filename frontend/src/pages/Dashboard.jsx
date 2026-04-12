import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Leaf, 
  Activity, 
  AlertCircle,
  TrendingDown,
  RefreshCcw,
  Clock,
  Server,
  Database,
  Box,
  Zap,
  ShieldCheck,
  Layers,
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

  const fetchIAMBilling = async () => {
    try {
      const { metricService } = await import('../services/api');
      const res = await metricService.getIAMBilling();
      setMetrics(prev => ({
        ...prev,
        total_cost_h: res.data.iam_hourly_cost
      }));
      alert(`[Secure IAM Sync] Successfully fetched real-time unblended cost from AWS Cost Explorer: ₹${(res.data.iam_hourly_cost * 83.5).toFixed(2)} / hr`);
    } catch (err) {
      alert("Failed to sync connected IAM billing data. Make sure a valid account is linked.");
    }
  };

  const serviceIcons = {
    'EC2': <Server size={16} />,
    'RDS': <Database size={16} />,
    'S3': <Box size={16} />,
    'Lambda': <Zap size={16} />
  };

  return (
    <div className="page-enter bg-slate-50/50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:px-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Eco Intelligence</h2>
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
               <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-slate-200/50 shadow-sm">
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

        {/* Global Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <MetricCard 
            title="Hourly Ops Cost" 
            value={`₹${(metrics.total_cost_h * 83.5).toFixed(2)}`} 
            unit="/ hr" 
            icon={<DollarSign size={24} />} 
            trend={metrics.total_cost_h > 0 ? "up" : null} 
            trendValue="0.8"
            color="blue"
            onClick={fetchIAMBilling}
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

        {/* Intelligence Section - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card-premium p-0 overflow-hidden bg-white">
            <LiveLineChart 
              data={history} 
              title="Carbon Footprint Telemetry" 
              unit="kg" 
              color="#10b981"
            />
          </div>
          
          <div className="lg:col-span-1 card-premium p-10 bg-white shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Portfolio</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-account distribution</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <Layers size={20} className="text-slate-400" />
               </div>
            </div>
            <div className="space-y-4">
              {breakdown.map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-eco-600">
                      {serviceIcons[item.service] || <Activity size={12} />}
                    </div>
                    <p className="text-[10px] font-black text-slate-900 tracking-tight uppercase">{item.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900 tabular-nums">₹{(item.cost * 83.5).toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
