import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowRight, ShieldCheck, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('admin@greenops.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials or server unreachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eco-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-eco-100 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-auto relative z-10"
      >
        <div className="flex justify-center flex-col items-center">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-eco-500/10 mb-4 border border-eco-100">
            <Leaf className="text-eco-600 w-10 h-10" fill="currentColor" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center">GreenOps Platform</h2>
          <p className="mt-2 text-center text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-center space-x-2">
            <ShieldCheck size={14} className="text-eco-500" />
            <span>Sustainable Infrastructure Intelligence</span>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-xl py-10 px-10 shadow-2xl rounded-[2.5rem] border border-white sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-eco-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-sm font-bold placeholder-gray-400"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Security Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-eco-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:ring-4 focus:ring-eco-500/10 focus:border-eco-500 transition-all text-sm font-bold placeholder-gray-400"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 bg-eco-600 hover:bg-eco-700 text-white font-black rounded-2xl shadow-xl shadow-eco-500/20 transform active:scale-95 transition-all space-x-2 group items-center text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="tracking-widest uppercase">AUTHENTICATE</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm font-bold">
                  <span className="px-4 bg-white text-gray-400 uppercase tracking-widest text-[10px]">Or continue with</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-3 px-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-600 hover:bg-gray-50 transition-all space-x-3 items-center text-sm font-bold"
                >
                  <Github size={20} />
                  <span>GitHub Enterprise</span>
                </button>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-tighter">
            © 2026 GREENOPS SUSTAINABILITY CORE • ALL RIGHTS RESERVED
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
