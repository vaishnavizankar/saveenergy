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
      // Backend expects title as a query parameter
      await api.post('/reports/generate', null, { 
        params: { title: `Sustainability Audit ${new Date().toLocaleDateString()}` } 
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
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
               <Lock size={14} className="text-eco-600" />
               <span className="uppercase tracking-widest text-[10px] font-black">Cryptographic Authenticity Guaranteed</span>
             </div>
             <span className="h-4 w-[1px] bg-slate-200"></span>
             <div className="badge-eco px-4 py-1.5 flex items-center gap-2">
                <CheckCircle2 size={12} strokeWidth={3} />
                <span>Auditor Ready</span>
             </div>
          </div>
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
        <div className="lg:col-span-8">
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
                                  <p className="text-sm font-black text-slate-900 tracking-tight">{report.name || `Sustainability_Audit_${report.date}`}</p>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                     <HardDrive size={10} />
                                     <span>2.4 MB · Application/PDF</span>
                                  </div>
                               </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-700">{report.date}</span>
                               <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">UTC Archive</span>
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

        {/* Action Panel */}
        <div className="lg:col-span-4 flex flex-col gap-10">
           <div className="card-premium p-10 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity scale-150 rotate-12 duration-1000">
                 <ShieldCheck size={160} />
              </div>
              
              <div className="relative z-10 flex flex-col">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                       <Lock size={24} className="text-eco-400" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-[0.2em] leading-tight">Compliance Tracking</h3>
                       <p className="text-[10px] font-black text-eco-400 uppercase tracking-widest mt-1">Audit Protocol V4.2</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6 mb-12 flex-1">
                    {[
                      { label: "Data Integrity Check", status: "Verified", color: "text-emerald-400" },
                      { label: "AWS Cost Reconciliation", status: "Active", color: "text-blue-400" },
                      { label: "Grid Intensity Sync", status: "Real-time", color: "text-amber-400" }
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4">
                         <span className="text-xs font-medium text-slate-400">{step.label}</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${step.color}`}>{step.status}</span>
                      </div>
                    ))}
                 </div>

                 <motion.button 
                   whileHover={{ x: 5 }}
                   className="btn-primary w-full py-6 rounded-[2.5rem] bg-eco-600 hover:bg-eco-500 border-none font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-auto"
                 >
                    <span>View Analytics Explorer</span>
                    <ChevronRight size={18} />
                 </motion.button>
              </div>
           </div>

           <div className="card-premium p-10 bg-white border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <BarChart3 size={20} />
                 </div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">Audit Frequency</h4>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-10">
                 GreenOps automatically initiates a high-resolution sustainability audit every <span className="text-slate-900 font-bold">24 operating hours</span> to ensure institutional transparency.
              </p>
              <div className="flex items-center gap-4 group cursor-default">
                 <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-br from-slate-100 to-slate-200">
                          <CheckCircle2 size={14} className="text-eco-600" />
                       </div>
                    ))}
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Reports Pending Review</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
