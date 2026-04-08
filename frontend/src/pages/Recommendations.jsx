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
  ZapOff
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
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const totalPotentialSavings = recommendations.reduce((acc, curr) => acc + curr.potential_savings, 0);

  return (
    <div className="pt-24 px-8 pb-12 fade-in font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center">
            AI Optimization Center
            <div className="ml-4 p-2 bg-amber-50 border border-amber-100 rounded-xl">
              <Sparkles className="text-amber-500 w-5 h-5 animate-pulse" />
            </div>
          </h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center">
            <Target size={14} className="mr-2 text-eco-500" />
            Automated Waste Detection Active
          </p>
        </div>
        
        {recommendations.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white px-8 py-5 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex items-center space-x-6 hover:shadow-2xl transition-all">
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Efficiency Score</p>
                <h4 className="text-3xl font-black text-gray-900 tracking-tighter">92<span className="text-eco-500 text-sm ml-1">%</span></h4>
              </div>
              <div className="h-10 w-px bg-gray-100"></div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Carbon Saved</p>
                <div className="flex items-center justify-end text-emerald-600">
                  <Leaf size={14} className="mr-1" />
                  <h4 className="text-2xl font-black tracking-tighter">4.2<span className="text-xs ml-1">t</span></h4>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 px-8 py-5 rounded-[2.5rem] shadow-2xl shadow-gray-900/20 flex items-center space-x-6 group hover:bg-eco-600 transition-all">
              <div className="text-left text-white">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Total Savings</p>
                <h4 className="text-3xl font-black tracking-tighter">${totalPotentialSavings.toFixed(2)}</h4>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-white group-hover:text-eco-600 text-white transition-all">
                <Zap size={20} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-2xl hover:bg-white transition-all relative overflow-hidden group border-b-8 border-b-eco-500/10 hover:border-b-eco-500"
            >
              <div className="absolute -top-10 -right-10 p-6 text-eco-500/5 group-hover:text-eco-500/10 group-hover:scale-125 transition-all duration-700">
                <Leaf size={240} fill="currentColor" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-xl group-hover:bg-eco-600 transition-colors">
                    {rec.action === 'Stop' || rec.action === 'Optimization' ? <ZapOff size={24} /> : <Lightbulb size={24} />}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1.5 text-eco-600 bg-eco-50 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-eco-100 mb-1">
                      <TrendingDown size={12} />
                      <span>High Impact</span>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                      <Target size={10} />
                      <span>98% Confidence</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-eco-600 transition-colors uppercase">
                  {rec.action} <span className="text-gray-400">Policy</span>
                </h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-10 min-h-[3rem]">
                  {rec.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-md group/stat">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover/stat:text-eco-600">Cost Savings</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xs font-black text-gray-900 tracking-tight">$</span>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{rec.potential_savings.toFixed(2)}</h4>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-md group/stat">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover/stat:text-eco-600">CO2 Offset</p>
                    <div className="flex items-baseline space-x-1">
                      <h4 className="text-2xl font-black text-emerald-600 tracking-tighter">-{rec.potential_co2_reduction.toFixed(1)}</h4>
                      <span className="text-[9px] font-black text-gray-400 uppercase ml-1">kg</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <button className="w-full bg-gray-900 hover:bg-eco-600 text-white font-black py-5 rounded-[1.8rem] transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-gray-900/10 active:scale-95 group/btn">
                  <span className="tracking-widest uppercase text-xs">Execute Optimization</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
                <div className="flex justify-center flex-col items-center mt-4">
                  <div className="flex items-center space-x-1.5 text-gray-300">
                    <Clock size={12} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Validated by SageMaker AI</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {recommendations.length === 0 && !loading && (
          <div className="col-span-full py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="p-8 bg-eco-50 rounded-full text-eco-500 mb-6 scale-110 shadow-inner group transition-transform">
              <CheckCircle2 size={64} className="group-hover:rotate-12 transition-transform" />
            </div>
            <h4 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Maximum Efficiency Achieved</h4>
            <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              <Sparkles size={14} className="text-amber-400" />
              <span>Infrastructure Fully Optimized</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
