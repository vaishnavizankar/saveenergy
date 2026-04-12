import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  MapPin, 
  Wind, 
  CloudRain, 
  Activity, 
  Calendar,
  ChevronRight,
  TrendingDown,
  Info,
  Globe,
  Sun,
  Droplets,
  Trees,
  TrendingUp,
  CloudLightning
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveLineChart from '../components/Charts/LiveLineChart';
import { metricService } from '../services/api';

const Carbon = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCarbon, setLiveCarbon] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, liveRes] = await Promise.all([
          metricService.getTimeSeries(1),
          metricService.getLive()
        ]);

        const transform = histRes.data.map(item => ({
          time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: item.carbon
        }));
        setHistory(transform);
        setLiveCarbon(liveRes.data.total_carbon_h);
      } catch (err) {
        console.error("Carbon data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-enter bg-slate-50/50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:px-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Impact Footprint</h2>
            <div className="flex items-center gap-4 mt-3">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                 <Globe size={14} className="text-eco-500" />
                 <span className="uppercase tracking-widest text-[10px] font-black">Environmental Metrics Active</span>
               </div>
               <span className="h-4 w-[1px] bg-slate-200"></span>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Wind size={14} className="text-blue-400" />
                  <span className="uppercase tracking-widest text-[10px] font-black">GHG Protocol Compliant</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-eco-500 flex items-center justify-center text-white shadow-glow-eco">
                  <Leaf size={20} fill="currentColor" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offset Performance</p>
                  <p className="text-xl font-black text-slate-900 text-shadow-sm">42.8 <span className="text-xs">kg CO₂e</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Responsive Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
             <div className="card-premium p-0 overflow-hidden bg-white">
                <LiveLineChart 
                  data={history} 
                  title="Emissions Telemetry (Real-time)" 
                  unit="kg" 
                  color="#10b981"
                />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="card-premium p-8 bg-white border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portfolio Offset</p>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight">32 Trees</h4>
                      <p className="text-[9px] font-bold text-eco-500 uppercase mt-2">Offset Equivalent</p>
                   </div>
                   <div className="p-4 bg-eco-50 text-eco-400 rounded-3xl group-hover:scale-125 transition-transform">
                      <Trees size={32} />
                   </div>
                </div>
                <div className="card-premium p-8 bg-white border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Energy Balance</p>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight">1.2 MWh</h4>
                      <p className="text-[9px] font-bold text-blue-500 uppercase mt-2">Saved Today</p>
                   </div>
                   <div className="p-4 bg-blue-50 text-blue-400 rounded-3xl group-hover:scale-125 transition-transform">
                      <CloudLightning size={32} />
                   </div>
                </div>
             </div>
          </div>

          {/* KPI Dashboard Column */}
          <div className="lg:col-span-1">
             <motion.div 
                whileHover={{ y: -5 }}
                className="card-premium p-10 bg-eco-600 text-white relative overflow-hidden h-full flex flex-col justify-between"
             >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Sun size={160} />
                </div>
                
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-eco-100 uppercase tracking-[0.3em] mb-4 opacity-80">Grid Intensity</p>
                   <div className="flex items-baseline gap-2 mb-2">
                      <h4 className="text-7xl font-black tracking-tighter tabular-nums text-shadow-glow">
                        {liveCarbon.toFixed(2)}
                      </h4>
                      <span className="text-xl font-bold text-eco-200">kg</span>
                   </div>
                   <p className="text-xs font-black text-eco-100 uppercase tracking-[0.2em] mb-12 opacity-90">CO₂e PER HOUR</p>
                   
                   <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                         <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-eco-400 shadow-glow-eco"></div></div>
                         <p className="text-sm font-medium text-eco-50 leading-relaxed">System emissions are <span className="text-white font-black">4.2% lower</span> than the region average.</p>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                         <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-eco-400 shadow-glow-eco"></div></div>
                         <p className="text-sm font-medium text-eco-50 leading-relaxed">Transitioning to <span className="text-white font-bold underline decoration-eco-300 underline-offset-4">Spot Instances</span> could reduce footprint by 22%.</p>
                      </div>
                   </div>
                </div>

                <motion.button 
                   whileHover={{ x: 5 }}
                   className="mt-12 w-full p-6 rounded-[2rem] bg-white text-eco-600 font-black flex items-center justify-between group shadow-xl"
                >
                   <span className="uppercase tracking-[0.2em] text-[10px]">Impact Roadmap</span>
                   <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
             </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Carbon;
