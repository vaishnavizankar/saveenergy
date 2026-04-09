import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Activity,
  ChevronRight,
  Globe,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Bypassing real login for local demo
    localStorage.setItem('token', 'demo-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-eco-100">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-eco-100/30 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4"
      >
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 15 }}
            className="inline-flex bg-white p-7 rounded-[2.5rem] shadow-elevated border border-eco-50 mb-10 group"
          >
            <Leaf className="text-eco-600 w-12 h-12 transition-transform duration-500 group-hover:scale-110" fill="currentColor" />
          </motion.div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">GreenOps</h2>
          <div className="flex items-center justify-center gap-3">
             <span className="h-[1px] w-8 bg-slate-200"></span>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Core Principal Access</p>
             <span className="h-[1px] w-8 bg-slate-200"></span>
          </div>
        </div>

        <div className="card-premium p-10 md:p-14 bg-white/70">
          <form className="space-y-8" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Institutional Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-eco-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="input-field w-full pl-16 py-5 rounded-[2rem] bg-white"
                  placeholder="admin@company.eco"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 ml-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Password</label>
                <Link to="/forgot-password" name="forgot-password" id="forgot-password" className="text-[9px] font-black text-eco-600 hover:text-eco-700 uppercase tracking-widest underline decoration-eco-100 underline-offset-4">Reset Credentials</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-eco-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="input-field w-full pl-16 py-5 rounded-[2rem] bg-white"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-6">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary py-6 rounded-[2.5rem] bg-slate-900 group overflow-hidden"
              >
                <span className="relative z-10 text-xs font-black uppercase tracking-[0.3em]">Initialize Session</span>
                <div className="absolute inset-0 bg-eco-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <ChevronRight size={20} className="relative z-10 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
              
              <div className="flex items-center justify-center gap-4 py-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                 <ShieldCheck size={16} className="text-eco-600" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Protected by GreenOps Protocol</span>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">
           <div className="flex items-center gap-10">
              <div className="flex flex-col items-center">
                 <Globe size={20} className="text-slate-200 mb-2" />
                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Global Sync</span>
              </div>
              <div className="flex flex-col items-center">
                 <Activity size={20} className="text-slate-200 mb-2" />
                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Real-time Stats</span>
              </div>
              <div className="flex flex-col items-center">
                 <Sparkles size={20} className="text-slate-200 mb-2" />
                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">AI Insights</span>
              </div>
           </div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] text-center">
              © 2026 Core Infrastructure. Operational.
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
