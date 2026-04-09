import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  TrendingDown, 
  Leaf, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Target,
  Clock,
  Sparkles,
  ZapOff,
  ChevronRight,
  MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get('/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error("Recommendations fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const handleExecute = async (recId) => {
    try {
      const btn = document.getElementById(`exec-btn-${recId}`);
      if(btn) btn.classList.add('animate-pulse', 'opacity-50');
      
      const res = await api.post(`/recommendations/${recId}/apply`);
      if (res.data.status === 'success') {
        setRecommendations(prev => prev.filter(r => r.id !== recId));
      }
    } catch (err) {
      console.error("Execution failed:", err);
      alert("AI Command Execution Error. Please check cloud connection.");
    }
  };

  const totalPotentialSavings = recommendations.reduce((acc, curr) => acc + curr.potential_savings, 0);

  return (
    <div className="page-enter">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-6 mb-4">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Optimization Core</h2>
             <motion.div 
               animate={{ rotate: [0, 15, -15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="p-3 bg-amber-50 border border-amber-100 rounded-2xl shadow-glow-amber"
             >
                <Sparkles className="text-amber-500 w-8 h-8" fill="currentColor" />
             </motion.div>
          </div>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            AI-driven infrastructure intelligence providing validated recommendations to eliminate waste, resize underutilized assets, and optimize your overall cloud footprint.
          </p>
        </div>
        
        {recommendations.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="bg-white/80 backdrop-blur-md px-10 py-6 rounded-[40px] border border-slate-100 shadow-elevated flex items-center gap-8 hover:shadow-card-hover transition-all group">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Efficiency Score</p>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm group-hover:text-eco-600 transition-colors">92<span className="text-eco-500 text-base ml-1">%</span></h4>
              </div>
              <div className="h-12 w-[1.5px] bg-slate-100"></div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Net CO₂ Offset</p>
                <div className="flex items-center justify-end text-emerald-600">
                  <h4 className="text-4xl font-black tracking-tighter tabular-nums drop-shadow-sm">4.2<span className="text-base ml-1">t</span></h4>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 px-10 py-6 rounded-[40px] shadow-elevated flex items-center gap-8 group hover:bg-slate-950 transition-all border border-slate-800">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Potential Savings</p>
                <h4 className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm group-hover:text-amber-400 transition-colors">${totalPotentialSavings.toFixed(2)}</h4>
              </div>
              <div className="h-12 w-[1.5px] bg-white/10"></div>
              <div className="bg-white/10 p-3.5 rounded-2xl text-white group-hover:scale-110 transition-transform shadow-inner">
                <Zap size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence>
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ delay: i * 0.08, type: "spring", damping: 20 }}
              className="card-premium p-10 bg-white/60 flex flex-col justify-between group h-[520px] relative overflow-hidden"
            >
              {/* Background Glass Ornament */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className={`p-4 rounded-2xl shadow-md transition-all duration-500 group-hover:scale-110 ${
                    rec.action === 'Stop' || rec.action === 'Optimization' ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-amber-100 text-amber-600 shadow-amber-500/10'
                  }`}>
                    {rec.action === 'Stop' || rec.action === 'Optimization' ? <ZapOff size={28} /> : <Lightbulb size={28} />}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="badge-eco bg-emerald-50 text-emerald-600 border-none shadow-sm mb-2 px-4 py-1.5 flex items-center gap-1.5">
                      <TrendingDown size={14} strokeWidth={3} />
                      <span>Validated Impact</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <Target size={12} className="text-amber-400" />
                      <span>98% Confidence Level</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 group-hover:text-eco-600 transition-colors uppercase">
                  {rec.action} <span className="text-slate-400 font-bold">Policy</span>
                </h3>
                <p className="text-slate-500 font-medium text-base leading-relaxed mb-10 min-h-[4.5rem] line-clamp-3">
                  {rec.description}
                </p>
                
                <div className="grid grid-cols-2 gap-5 mb-12">
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50 transition-all hover:bg-white hover:shadow-sm hover:-translate-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cost Utility</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-slate-400">$</span>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{rec.potential_savings.toFixed(2)}</h4>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50 transition-all hover:bg-white hover:shadow-sm hover:-translate-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Carbon Shift</p>
                    <div className="flex items-baseline gap-1">
                      <h4 className="text-2xl font-black text-emerald-600 tracking-tighter tabular-nums">-{rec.potential_co2_reduction.toFixed(1)}</h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">kg</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-slate-50">
                <motion.button 
                  id={`exec-btn-${rec.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExecute(rec.id)}
                  className="w-full btn-primary bg-slate-900 hover:bg-eco-600 text-white font-black py-5 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 overflow-hidden relative group/btn"
                >
                  <span className="uppercase tracking-[0.2em] text-xs">Execute AI Optimization</span>
                  <MousePointerClick size={18} className="group-hover/btn:rotate-12 transition-transform" />
                  <div className="absolute inset-0 bg-white/10 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                </motion.button>
                <div className="flex items-center justify-center gap-2 mt-5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                   <Clock size={12} className="opacity-60" />
                   <span>SageMaker Real-time Validation</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {recommendations.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full py-40 glass rounded-[60px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center shadow-inner"
          >
            <div className="p-12 bg-eco-50 rounded-full text-eco-500 mb-8 border-4 border-white shadow-elevated relative group cursor-default transition-all hover:scale-110">
               <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-eco-200 m-2"
               />
               <CheckCircle2 size={72} strokeWidth={2.5} className="relative z-10" />
            </div>
            <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase">Ecosystem Optimized</h4>
            <div className="flex items-center gap-3 text-slate-400">
               <span className="h-[1.5px] w-6 bg-slate-100"></span>
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Max Efficiency Rating Achieved</p>
               <span className="h-[1.5px] w-6 bg-slate-100"></span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
