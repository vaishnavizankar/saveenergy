import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  TrendingDown, 
  Leaf, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck,
  Zap
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

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Optimization Center</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Intelligent suggestions for cost & carbon reduction</p>
        </div>
        
        <div className="bg-eco-50 px-4 py-2 rounded-2xl border border-eco-100 flex items-center space-x-2">
          <ShieldCheck size={16} className="text-eco-600" />
          <span className="text-[10px] font-black text-eco-700 tracking-widest uppercase">Verified Recommendations</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:bg-white/90 transition-all relative overflow-hidden group"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-eco-400/10 rounded-full blur-2xl group-hover:bg-eco-400/20 transition-colors"></div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-eco-100 text-eco-600 rounded-2xl">
                    {rec.action === 'Stop' ? <Zap size={20} /> : <Lightbulb size={20} />}
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    <TrendingDown size={14} />
                    <span>High Impact</span>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">{rec.action} Resource</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">{rec.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Savings</p>
                    <p className="text-sm font-black text-gray-900 flex items-center justify-center">
                      <DollarSign size={14} className="text-eco-600 mr-0.5" />
                      {rec.potential_savings.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CO2 Reduction</p>
                    <p className="text-sm font-black text-gray-900 flex items-center justify-center">
                      <Leaf size={14} className="text-emerald-500 mr-0.5" />
                      {rec.potential_co2_reduction.toFixed(2)}kg
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-gray-900 group-hover:bg-eco-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg group-active:scale-95">
                <span>Implement Change</span>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {recommendations.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-white rounded-full shadow-sm text-gray-200 mb-4"><CheckCircle2 size={48} /></div>
            <h4 className="text-xl font-bold text-gray-400">Your infrastructure is optimized</h4>
            <p className="text-gray-400 text-sm mt-1 uppercase font-black tracking-widest">No waste detected in the current cycle</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
