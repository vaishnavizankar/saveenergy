import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Leaf, 
  Activity, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Clock,
  Server,
  Database,
  Box,
  Zap,
  ShieldCheck,
  ZapOff,
  Layers
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
    // 1. Initial Load from Snapshot API
    const fetchInitialData = async () => {
      try {
        const [snapRes, breakRes, histRes] = await Promise.all([
          metricService.getLive(),
          metricService.getCostBreakdown(),
          metricService.getTimeSeries(1) // Last 24h
        ]);
        
        setMetrics(snapRes.data);
        setBreakdown(breakRes.data.breakdown);
        
        const chartData = histRes.data.slice(-10).map(item => ({
          time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: item.carbon
        }));
        setHistory(chartData);

      } catch (err) {
        console.error("Failed to fetch initial dashboard data:", err);
      }
    };
    fetchInitialData();

    // 2. Poll SageMaker status (Simple simulation for UI)
    const checkAI = setInterval(() => {
      setAiStatus(prev => {
        if (prev === 'PROVISIONING') return 'OPTIMIZING';
        if (prev === 'OPTIMIZING') return 'ONLINE';
        return prev;
      });
    }, 15000);

    // 3. WebSocket Implementation for Real-time Telemetry
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
          return next.slice(-10);
        });

        setLastUpdated(0);
      }
    };

    const timer = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);

    return () => {
      ws.close();
      clearInterval(timer);
      clearInterval(checkAI);
    };
  }, []);

  const serviceIcons = {
    'EC2': <Server size={14} />,
    'RDS': <Database size={14} />,
    'S3': <Box size={14} />,
    'Lambda': <Zap size={14} />
  };

  return (
    <div className="pt-24 px-8 pb-12 fade-in font-inter">
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Eco Dashboard</h2>
            {aiStatus === 'PROVISIONING' && (
              <div className="flex items-center space-x-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100 animate-pulse transition-all">
                <RefreshCcw size={14} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Engine Provisioning...</span>
              </div>
            )}
            {aiStatus === 'ONLINE' && (
              <div className="flex items-center space-x-2 bg-eco-50 text-eco-600 px-4 py-2 rounded-2xl border border-eco-100 shadow-sm shadow-eco-500/10">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sustainability AI Online</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 mt-3">
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-eco-600 bg-eco-50 px-3 py-1.5 rounded-full border border-eco-100 shadow-sm shadow-eco-500/5">
              <ShieldCheck size={14} />
              <span>Real-time AWS Telemetry Enabled</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <Clock size={14} />
              <span>Synced {lastUpdated}s ago</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={async () => {
            setLastUpdated(0);
            try {
              const { resourceService } = await import('../services/api');
              await resourceService.sync();
            } catch (err) {
              console.error("Sync failed:", err);
            }
          }}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/5 hover:scale-110 transition-all text-eco-600 hover:text-eco-700"
        >
          <RefreshCcw size={24} className={lastUpdated < 1 ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard 
          title="Hourly Running Cost" 
          value={`$${metrics.total_cost_h.toFixed(3)}`} 
          unit="/ hr" 
          icon={<DollarSign size={24} />} 
          trend="up" 
          trendValue="2.4"
        />
        <MetricCard 
          title="Carbon Intensity" 
          value={metrics.total_carbon_h.toFixed(2)} 
          unit="kg CO₂e" 
          icon={<Leaf size={24} />} 
          color="emerald"
          trend="down" 
          trendValue="1.2"
        />
        <MetricCard 
          title="Active Resources" 
          value={metrics.running_resources} 
          unit="Instances" 
          icon={<Activity size={24} />} 
          color="blue"
        />
        <MetricCard 
          title="Idle Detections" 
          value={metrics.idle_resources} 
          unit="Anomalies" 
          icon={<AlertCircle size={24} />} 
          color="amber"
          trend="up"
          trendValue={metrics.idle_resources > 0 ? "100" : "0"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <LiveLineChart 
            data={history} 
            title="Real-time Carbon Footprint Trends" 
            unit="kg" 
            color="#10b981"
          />

          <div className="glass p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center space-x-2">
              <Layers size={20} className="text-eco-600" />
              <span>Multi-Service Health Portfolio</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-gray-50/30 rounded-2xl border border-gray-100/50 hover:bg-white transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-eco-600 group-hover:scale-110 transition-transform">
                      {serviceIcons[item.service] || <Activity size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.service}</p>
                      <p className="text-[10px] font-bold text-gray-400">AWS Managed Service</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-eco-600">${item.cost.toFixed(3)}/hr</p>
                    <div className="flex items-center space-x-1 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full bg-eco-500"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Operational</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white h-auto flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ZapOff size={120} className="-rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-[1.2rem]">
                  <TrendingDown size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Optimization Center</h3>
              </div>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                GreenOps AI has identified <span className="text-amber-600 font-extrabold">{metrics.idle_resources} high-impact waste detection(s)</span> within your current multi-account setup.
              </p>
              
              <div className="bg-eco-50/30 p-6 rounded-3xl border border-eco-100/50 mb-8 backdrop-blur-sm">
                <p className="text-[10px] font-black text-eco-600 uppercase tracking-widest mb-2">Monthly Saving Target</p>
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-4xl font-black text-gray-900 tracking-tighter">${(metrics.idle_resources * 45.2).toFixed(2)}</h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Per Cycle</span>
                </div>
                <div className="flex items-center space-x-2 text-eco-600 mt-4 text-[10px] font-black uppercase bg-white/60 p-2 rounded-xl w-fit border border-eco-50">
                  <Leaf size={14} fill="currentColor" />
                  <span>-15.4 kg CO₂e / month</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = '/recommendations'}
              className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-2xl shadow-gray-900/10 transform active:scale-95 transition-all flex items-center justify-center space-x-3 group relative overflow-hidden"
            >
              <span className="tracking-widest uppercase text-xs">Execute Optimization</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform text-eco-400" />
            </button>
          </div>
          
          <div className="glass p-8 rounded-[2.5rem] border border-gray-100 min-h-[200px] flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Zap size={32} fill="currentColor" className="opacity-20" />
            </div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">System Integrity</h4>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Active Verification Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
