import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  Search,
  Filter,
  FileDown,
  RefreshCcw,
  CheckCircle2,
  HardDrive,
  ExternalLink,
  Lock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Create a clean date-time string
      const now = new Date();
      const dateString = now.toLocaleDateString().replace(/\//g, '-');
      const timeString = now.toLocaleTimeString().replace(/:/g, '-');
      const titleStr = `Sustainability_Audit_${dateString}_${timeString}`;

      // Backend expects title as a query parameter
      await api.post('/reports/generate', null, { 
        params: { title: titleStr } 
      });
      await fetchReports();
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Encryption Engine Error. Report generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Compliance Vault</h2>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          disabled={generating}
          className={`btn-primary bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-3xl shadow-xl flex items-center gap-4 group ${generating ? 'opacity-50' : ''}`}
        >
          {generating ? <RefreshCcw className="animate-spin" size={20} /> : <FileDown size={20} className="group-hover:-translate-y-0.5 transition-transform" />}
          <span className="uppercase tracking-[0.2em] font-black text-xs">Generate Sustainability Audit</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Reports List */}
        <div className="lg:col-span-12">
           <div className="card-premium overflow-hidden bg-white/60">
              <div className="p-10 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verified Infrastructure Artifacts</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Available for institutional download</p>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <Search size={16} className="text-slate-400" />
                    <input type="text" placeholder="Filter vault..." className="bg-transparent text-xs font-bold outline-none w-32 placeholder:text-slate-300" />
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Artifact Document</th>
                      <th>Generation Epoch</th>
                      <th>Security Seal</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {reports.map((report, i) => (
                        <motion.tr 
                          key={report.id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group"
                        >
                          <td>
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                                  <FileText size={18} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 tracking-tight">{report.title}</p>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                     <HardDrive size={10} />
                                     <span>2.4 MB · Application/PDF</span>
                                  </div>
                               </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-700">{new Date(report.generated_at).toLocaleString()}</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2 bg-eco-50/50 text-eco-600 border border-eco-100/50 px-3 py-1.5 rounded-full w-fit">
                               <ShieldCheck size={14} strokeWidth={3} />
                               <span className="text-[10px] font-black uppercase tracking-widest">Signed</span>
                            </div>
                          </td>
                          <td className="text-right">
                             <motion.a 
                               whileHover={{ scale: 1.1, backgroundColor: '#f8fafc' }}
                               whileTap={{ scale: 0.9 }}
                               href={`${api.defaults.baseURL}/reports/download/${report.id || i}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-flex p-3 rounded-2xl border border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm"
                             >
                                <Download size={18} />
                             </motion.a>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {reports.length === 0 && !loading && (
                   <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                         <Search size={32} />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Vault currently non-populated</p>
                   </div>
                )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
