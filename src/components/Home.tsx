import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Zap, Target, ShieldCheck, Linkedin, Cpu, Globe, Database, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Home() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLinkedInLogin = async () => {
    setError(null);
    if (user) {
      navigate('/dashboard');
    } else {
      try {
        await signIn(); 
        navigate('/dashboard');
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          setError("Session termination: Authentication window closed.");
        } else if (err.code === 'auth/popup-blocked') {
          setError("Protocol error: Browser blocked authentication popup.");
        } else if (err.code === 'auth/unauthorized-domain') {
          setError(`Domain "${window.location.hostname}" is not authorized. Enable it in the project kernel (Firebase).`);
        } else {
          setError("Critical failure: Cloud authentication unreachable.");
        }
        console.error("LinkedIn login simulation failed:", err);
      }
    }
  };

  return (
    <div className="relative min-h-screen grid-technical selection:bg-[#0077b5]/30">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="h-8 w-8 bg-[#0077b5] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,119,181,0.5)]">
              <Linkedin className="h-5 w-5 text-white fill-white/10" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter">LI-INTEL</span>
            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded ml-2 text-gray-500 font-mono tracking-widest">v4.2.0</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#engine" className="hover:text-white transition-colors">Engine</a>
            <a href="#network" className="hover:text-white transition-colors">Edge Network</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <button 
            onClick={handleLinkedInLogin}
            className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
          >
            Terminal Access
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#0077b5] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Autonomous Intelligence Relay Active</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
              AUTONOMOUS <br />
              <span className="text-[#0077b5]">LINKEDIN AGENT</span>
            </h1>
            
            <p className="max-w-xl mx-auto text-lg text-gray-500 font-medium leading-relaxed mb-12">
              Transform your passive scroll into an active pipeline. Our edge-computed agent monitors feed signals to extract high-value career data, job leads, and technical intelligence in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="relative group">
                <button
                  onClick={handleLinkedInLogin}
                  className="btn-professional btn-primary"
                >
                  Deploy AI Agent
                  <ArrowRight className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-16 left-0 right-0 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-col items-start px-6 border-l border-white/10">
                <span className="text-2xl font-display font-black">12.4K</span>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active Deployments</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div id="engine" className="max-w-7xl mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card p-12 hover:border-[#0077b5]/30 group transition-all">
            <Cpu className="h-12 w-12 text-[#0077b5] mb-8 group-hover:scale-110 transition-transform" />
            <h3 className="text-3xl font-black mb-4">Neural Scraping Engine</h3>
            <p className="text-gray-400 max-w-md">Our headless engine doesn't just scroll—it interprets. Using localized LLMs, it parses content, intent, and career relevance without human supervision.</p>
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
               <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Extraction Latency</h4>
                  <p className="font-display font-bold text-xl">420ms / post</p>
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Analysis Depth</h4>
                  <p className="font-display font-bold text-xl">84% Precision</p>
               </div>
            </div>
          </div>

          <div className="glass-card p-12 bg-[#0077b5]/5 border-[#0077b5]/20">
            <Globe className="h-10 w-10 text-[#0077b5] mb-8" />
            <h3 className="text-2xl font-black mb-4 font-display italic">Global Access</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Whether on Localhost:3000 or production Vercel, the kernel maintains persistent SQL/Firebase sync across all edge nodes.</p>
            <div className="mt-8 space-y-3">
              {['Multi-Endpoint Support', 'SQL Persistence', 'Auth Relay Bridge'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                   <Target className="h-3 w-3 text-[#0077b5]" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-12 flex flex-col justify-end">
            <Server className="h-10 w-10 text-emerald-500 mb-8" />
            <h3 className="text-xl font-black mb-2">Enterprise Persistence</h3>
            <p className="text-sm text-gray-500">Every analysis is audited in our local SQLite 3.x database for maximum operational transparency.</p>
          </div>

          <div className="md:col-span-2 glass-card p-12 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex flex-col md:flex-row gap-12">
               <div className="flex-1">
                 <Database className="h-10 w-10 text-purple-500 mb-8" />
                 <h3 className="text-2xl font-black mb-4">Relational Integrity</h3>
                 <p className="text-sm text-gray-500">Full Go/SQL backend blueprints ensure your data is ready for enterprise migration when you scale up from the prototype layer.</p>
               </div>
               <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 p-6 font-mono text-[10px] text-gray-600">
                  <p className="text-blue-500 mb-2">// LI-INTEL_SQL_SCHEMA</p>
                  <p>CREATE TABLE logs (</p>
                  <p className="pl-4">id SERIAL PRIMARY KEY,</p>
                  <p className="pl-4">relevance INTEGER,</p>
                  <p className="pl-4">type TEXT CHECK (type IN('Technical', 'Hiring', 'Toxic'))</p>
                  <p>);</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">© 2026 LI-INTEL Intelligence Corp.</p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
             <span>Protocol_v4</span>
             <span>Encrypted Session</span>
             <span>Audit_Log_Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
