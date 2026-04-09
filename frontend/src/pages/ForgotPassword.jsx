import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw, Key, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code + New Pass
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError('System verification failed. check email formatting.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Credential intensity low. Use 8+ characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.confirmReset(email, code, newPassword);
      setStep(3); // Success
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Invalid authorization code provided.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-900 selection:bg-eco-100">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-eco-100/30 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-float"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4"
      >
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ rotate: -15, scale: 1.1 }}
            className="inline-flex bg-white p-6 rounded-[2.5rem] shadow-elevated border border-eco-50 mb-8"
          >
            <RotateCcw className="text-eco-600 w-10 h-10" />
          </motion.div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Vault Recovery</h2>
          <div className="flex items-center justify-center gap-3">
             <span className="h-[1px] w-8 bg-slate-200"></span>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Secure Protocol Reset</p>
             <span className="h-[1px] w-8 bg-slate-200"></span>
          </div>
        </div>

        <div className="card-premium p-10 md:p-14 bg-white/70">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 text-center px-4">
                  Enter your registered institutional email. We will dispatch a <span className="text-slate-900 font-black">one-time authorization code</span>.
                </p>
                <form className="space-y-8" onSubmit={handleRequestReset}>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Identity Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-eco-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        className="input-field w-full pl-16 py-5 rounded-[2rem] bg-white"
                        placeholder="master@greenops.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-50 py-3 rounded-2xl border border-red-100">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-6 rounded-[2.5rem] bg-slate-900 group"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                      <>
                        <span className="relative z-10 text-xs font-black uppercase tracking-[0.3em]">Dispatch Code</span>
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 text-center px-4">
                  Code transmitted to <span className="text-slate-900 font-black tracking-tight">{email}</span>. Please verify and re-provision credentials.
                </p>
                <form className="space-y-8" onSubmit={handleConfirmReset}>
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Authorization Code</label>
                      <input
                        type="text"
                        required
                        className="input-field w-full py-5 rounded-[2rem] bg-white text-center font-black text-lg tracking-[0.8em] placeholder:tracking-normal"
                        placeholder="000000"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">New Security Credential</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-eco-600 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          required
                          className="input-field w-full pl-16 py-5 rounded-[2rem] bg-white"
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-50 py-3 rounded-2xl border border-red-100">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-6 rounded-[2.5rem] bg-eco-600 shadow-glow-eco"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                      <span className="text-xs font-black uppercase tracking-[0.3em]">Re-Provision Access</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div 
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="inline-flex bg-eco-50 p-6 rounded-full mb-8 border-4 border-white shadow-elevated"
                >
                  <CheckCircle2 size={56} className="text-eco-600" />
                </motion.div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Credentials Synchronized</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Re-initializing direct login path...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-10 border-t border-slate-50 flex justify-center">
            <Link to="/login" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.3em] flex items-center group">
              <ChevronRight size={14} className="rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Login Protocol
            </Link>
          </div>
        </div>
        
        <p className="mt-16 text-center text-[10px] text-slate-300 font-extrabold uppercase tracking-[0.5em]">
          © 2026 Core Infrastructure. Secure.
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
