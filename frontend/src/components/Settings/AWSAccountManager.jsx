import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  RefreshCcw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const AWSAccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ 
    name: '', 
    access_key_id: '', 
    secret_access_key: '', 
    region: 'us-east-1' 
  });
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/aws-accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      setError("Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/aws-accounts', newAccount);
      setNewAccount({ name: '', access_key_id: '', secret_access_key: '', region: 'us-east-1' });
      setShowAddForm(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add account. Please check your keys.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Are you sure? This will disconnect your AWS access.")) return;
    try {
      await api.delete(`/aws-accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
          <Cloud size={20} className="text-eco-600" />
          <span>Your Cloud Connections</span>
        </h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gray-900 hover:bg-eco-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg shadow-gray-900/10"
        >
          {showAddForm ? <span>Cancel</span> : <><Plus size={16} /><span>Connect Account</span></>}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-8 rounded-[2rem] border-2 border-eco-100 bg-white"
          >
            <form onSubmit={handleAddAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Friendly Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Personal-Dev-Account" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-eco-500/10 outline-none transition-all"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AWS Region</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-eco-500/10 outline-none transition-all"
                    value={newAccount.region}
                    onChange={(e) => setNewAccount({...newAccount, region: e.target.value})}
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Key ID</label>
                  <input 
                    required
                    type="text" 
                    placeholder="AKIA..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-eco-500/10 outline-none transition-all"
                    value={newAccount.access_key_id}
                    onChange={(e) => setNewAccount({...newAccount, access_key_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Access Key</label>
                  <input 
                    required
                    type="password" 
                    placeholder="Your AWS Secret" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-eco-500/10 outline-none transition-all"
                    value={newAccount.secret_access_key}
                    onChange={(e) => setNewAccount({...newAccount, secret_access_key: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start space-x-3">
                <ShieldCheck size={18} className="text-blue-600 mt-0.5" />
                <p className="text-[10px] text-blue-800 font-bold leading-relaxed uppercase tracking-tight">
                  Your keys are encrypted using AES-256 before being stored in our database. 
                  We only use them for read-only resource collection.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center space-x-2 text-xs font-black">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-eco-600 hover:bg-eco-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-eco-600/20 flex items-center justify-center space-x-2 transform active:scale-95 transition-all"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <span>Establish Trust Connection</span>}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-eco-500" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="glass py-16 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-gray-50 rounded-full text-gray-300 mb-4">
              <Cloud size={48} />
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 tracking-tight">No External Accounts Linked</h4>
            <p className="text-gray-400 text-sm font-medium max-w-xs mt-2">Add an IAM Role ARN to begin monitoring multiple AWS organizations.</p>
          </div>
        ) : (
          accounts.map((acc) => (
            <div key={acc.id} className="glass p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-eco-50 text-eco-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight">{acc.name}</h4>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter truncate max-w-md">{acc.role_arn}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[9px] font-black uppercase text-eco-600 bg-eco-50 px-2 py-0.5 rounded-md border border-eco-100">Live Sync</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase flex items-center">
                      <RefreshCcw size={10} className="mr-1" />
                      Every 5 Minutes
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  className="p-3 text-gray-400 hover:text-eco-600 transition-colors"
                  title="Test Connection"
                >
                  <RefreshCcw size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove Integration"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AWSAccountManager;
