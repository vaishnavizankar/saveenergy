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
    <div className="page-enter">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-6 mb-4">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Impact Footprint</h2>
             <motion.div 
               animate={{ y: [0, -5, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="p-3 bg-eco-50 border border-eco-100 rounded-2xl shadow-glow-eco"
             >
                <Leaf className="text-eco-600 w-8 h-8" fill="currentColor" />
             </motion.div>
          </div>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Real-time monitoring of global grid carbon intensity and your operational CO₂e emissions across all active AWS region clusters.
          </p>
        </div>
        
        <div className="flex gap-4">
            <div className="glass px-8 py-5 rounded-[40px] shadow-sm border border-white flex flex-col items-center justify-center text-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Intensity</span>
               <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">421</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">gCO₂/kWh</span>
               </div>
            </div>
            <div className="glass px-8 py-5 rounded-[40px] shadow-sm border border-white flex flex-col items-center justify-center text-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grid Health</span>
               <div className="flex items-center gap-2">
                  <Sun size={14} className="text-amber-500" />
                  <span className="text-sm font-bold text-slate-700">62% Renewable</span>
               </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        <div className="lg:col-span-8">
          <LiveLineChart 
            data={history} 
            title="Emission Trajectory (kg CO₂e)" 
            unit="kg" 
            color="#10b981"
          />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-10">
          <motion.div 
             whileHover={{ scale: 1.02 }}
             className="card-premium p-10 bg-gradient-to-br from-eco-500 to-eco-600 text-white relative overflow-hidden h-full flex flex-col justify-center items-center text-center"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay">
               <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 Q 50 0 100 100" stroke="white" strokeWidth="2" fill="transparent" />
                  <path d="M0 80 Q 50 10 100 80" stroke="white" strokeWidth="1" fill="transparent" />
               </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <p className="text-[11px] font-black text-eco-100 uppercase tracking-[0.3em] mb-4 opacity-80">Live Transmission Rate</p>
              <div className="flex items-baseline gap-2 mb-2">
                 <h4 className="text-7xl font-black tracking-tighter tabular-nums drop-shadow-lg">
                   {liveCarbon.toFixed(2)}
                 </h4>
              </div>
              <p className="text-xs font-black text-eco-100 uppercase tracking-[0.2em] mb-10 opacity-90">kg CO₂e per hour</p>
              
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-eco-100">
                   <TrendingDown size={16} />
                   <span className="text-[10px] font-extrabold uppercase tracking-widest">-4.2% Optimization Impact</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Insights Sub-cards */}
          <div className="grid grid-cols-2 gap-6">
             <div className="card-premium p-6 bg-white hover:bg-emerald-50 transition-colors group">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                   <Trees size={20} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Offset Equivalent</p>
                <p className="text-lg font-black text-slate-900 tracking-tight">32 Trees</p>
             </div>
             <div className="card-premium p-6 bg-white hover:bg-blue-50 transition-colors group">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                   <CloudLightning size={20} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Energy Saving</p>
                <p className="text-lg font-black text-slate-900 tracking-tight">1.2 MWh</p>
             </div>
          </div>
        </div>
      </div>

      {/* Region-wise Breakdown */}
      <div className="card-premium p-12 bg-white/40">
         <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Geographical Intensity</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">Global cluster distribution analytics</p>
            </div>
            <div className="badge-eco py-2 px-6">
               <Activity size={12} className="inline mr-2" />
               Live AWS API Probe
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { region: 'us-east-1', intensity: 'High Intensity', value: 480, color: 'text-amber-500', bg: 'bg-amber-50', icon: <MapPin size={16} /> },
              { region: 'us-west-2', intensity: 'Renewable Heavy', value: 210, color: 'text-eco-600', bg: 'bg-eco-50', icon: <Wind size={16} /> },
              { region: 'eu-central-1', intensity: 'Mixed Grid', value: 340, color: 'text-blue-500', bg: 'bg-blue-50', icon: <CloudRain size={16} /> },
              { region: 'ap-south-1', intensity: 'Carbon Intense', value: 590, color: 'text-red-500', bg: 'bg-red-50', icon: <CloudLightning size={16} /> },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="p-8 bg-white border border-slate-100 rounded-[35px] shadow-sm hover:shadow-card-hover transition-all"
              >
                 <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                       {item.icon}
                    </div>
                    <p className="font-black text-slate-900 tracking-tight uppercase text-sm">{item.region}</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intensity Status</span>
                       <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.intensity}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className={`h-full opacity-60 ${item.color.replace('text', 'bg')}`} style={{ width: `${(item.value / 600) * 100}%` }}></div>
                    </div>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Carbon;
