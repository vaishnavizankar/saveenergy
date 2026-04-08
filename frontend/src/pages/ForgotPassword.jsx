import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw, Key } from 'lucide-react';
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
      setError('Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.confirmReset(email, code, newPassword);
      setStep(3); // Success
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Invalid code or password requirements not met.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-inter text-gray-900">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-eco-100/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4"
      >
        <div className="text-center mb-10">
          <div className="inline-flex bg-white p-5 rounded-[2rem] shadow-2xl shadow-eco-500/10 mb-6 border border-eco-50">
            <RotateCcw className="text-secondary-600 w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black tracking-tight">Recover Access</h2>
          <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center space-x-2">
            <ShieldCheck size={16} className="text-secondary-500" />
            <span>Secure Password Recovery Flow</span>
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-3xl py-12 px-8 sm:px-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] border border-white">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 text-center px-2">
                  Enter your registered work email. We'll send you a <span className="text-gray-900 font-bold">verification code</span> to reset your access.
                </p>
                <form className="space-y-6" onSubmit={handleRequestReset}>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Work Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-secondary-600 transition-colors">
                        <Mail size={20} />
                      </div>
                      <input
                        type="email"
                        required
                        className="block w-full pl-14 pr-4 py-5 bg-white border border-gray-100 rounded-3xl focus:ring-8 focus:ring-secondary-500/5 focus:border-secondary-500 transition-all text-sm font-semibold shadow-sm"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-5 px-6 bg-gray-900 hover:bg-black text-white font-black rounded-3xl shadow-xl transform active:scale-[0.98] transition-all space-x-3 text-sm group"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                      <>
                        <span className="tracking-widest uppercase">SEND CODE</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 text-center px-2">
                  Code sent to <span className="text-gray-900 font-bold">{email}</span>. Please check your inbox and enter the details below.
                </p>
                <form className="space-y-6" onSubmit={handleConfirmReset}>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Verification Code</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-6 py-5 bg-white border border-gray-100 rounded-3xl focus:ring-8 focus:ring-secondary-500/5 focus:border-secondary-500 transition-all text-sm font-black text-center tracking-[0.5em] shadow-sm"
                        placeholder="000000"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">New Security Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-secondary-600 transition-colors">
                          <Key size={20} />
                        </div>
                        <input
                          type="password"
                          required
                          className="block w-full pl-14 pr-4 py-5 bg-white border border-gray-100 rounded-3xl focus:ring-8 focus:ring-secondary-500/5 focus:border-secondary-500 transition-all text-sm font-semibold shadow-sm"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-5 px-6 bg-secondary-600 hover:bg-secondary-700 text-white font-black rounded-3xl shadow-xl transform active:scale-[0.98] transition-all space-x-3 text-sm"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                      <span className="tracking-widest uppercase">RESET PASSWORD</span>
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
                <div className="inline-flex bg-green-50 p-4 rounded-full mb-6">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                <p className="text-sm font-medium text-gray-500">Your password has been updated. Redirecting you to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-10 border-t border-gray-50 flex justify-center">
            <Link to="/login" className="text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em] flex items-center">
              Back to Login
            </Link>
          </div>
        </div>
        
        <p className="mt-12 text-center text-[10px] text-gray-300 font-extrabold uppercase tracking-[0.4em]">
          © 2026 GREENOPS ECO-CORE INFRASTRUCTURE
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
