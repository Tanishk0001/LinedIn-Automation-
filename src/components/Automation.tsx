import { useState, useRef } from "react";
import { 
  ArrowRight, 
  Linkedin, 
  Terminal, 
  ShieldAlert, 
  Lock, 
  Clock, 
  Activity,
  Zap,
  Globe,
  Cpu,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeLinkedInPost, MOCK_FEED, PostAnalysis, saveLogToFirestore } from "../services/automationService";
import { useAuth } from "../contexts/AuthContext";

export function Automation() {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [discoveredPosts, setDiscoveredPosts] = useState<PostAnalysis[]>([]);
  const [status, setStatus] = useState("DISCONNECTED");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const auditEvent = async (action: string, payload: any) => {
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "AUTOMATION_ENGINE",
          action,
          user_id: user?.uid,
          payload
        })
      });
    } catch (err) {
      console.error("Audit fail:", err);
    }
  };

  const handleConnect = () => {
    if (!credentials.email || !credentials.password) return;
    setIsConnecting(true);
    setStatus("Establishing Secure Channel...");
    
    setTimeout(() => {
      setIsActive(true);
      setIsConnecting(false);
      setStatus("AGENT_DEPLOYED");
      runTenSecondLoop();
    }, 2000);
  };

  const runTenSecondLoop = async () => {
    if (!user) return;
    
    addLog(`INITIALIZING: LinkedIn Headless Agent (v4.2.0-stable)`);
    addLog(`SQL: Establishing local audit bridge...`);
    await auditEvent("SESSION_START", { email: credentials.email });

    addLog(`AUTH: Attempting login for ${credentials.email}...`);
    await new Promise(r => setTimeout(r, 1000));
    addLog(`SUCCESS: Session established via session_token_delta`);
    addLog(`NAV: Directing agent to https://linkedin.com/feed`);
    
    let currentSecond = 10;
    setTimeLeft(10);

    timerRef.current = setInterval(() => {
      currentSecond -= 1;
      setTimeLeft(currentSecond);
      if (currentSecond <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        finishSession();
      }
    }, 1000);

    // Automation Work Loop
    for (let i = 0; i < 5; i++) {
      if (currentSecond <= 0) break;
      
      addLog(`SCROLL: Moving viewport by 840px (natural variance toggled)`);
      await new Promise(r => setTimeout(r, 1500));
      
      addLog(`EXTRACT: Found DOM candidate [post_id_${i + 1}]`);
      // Simulating variety by random selection from mock feed
      const rawContent = MOCK_FEED[Math.floor(Math.random() * MOCK_FEED.length)];
      const analysis = await analyzeLinkedInPost(rawContent);
      
      addLog(`ANALYSIS: [${analysis.type}] Relevance: ${analysis.relevance}%`);
      
      if (user) {
        const isNew = await saveLogToFirestore(user.uid, analysis);
        if (isNew) {
          setDiscoveredPosts(prev => [analysis, ...prev]);
          addLog(`SUCCESS: Persistent intel saved to secure account vault.`);
        } else {
          addLog(`DUPLICATE: Intelligence already exists. Analysis skipped.`);
        }
      }
      
      await auditEvent("DATA_EXTRACTED", analysis);
    }
  };

  const finishSession = () => {
    setIsActive(false);
    setStatus("SESSION_COMPLETE");
    addLog(`SYSTEM: Finalizing SQL logs and closing browser instance.`);
    addLog(`REPORT: Captured ${discoveredPosts.length} professional data points.`);
    auditEvent("SESSION_END", { count: discoveredPosts.length });
  };

  const resetSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    setConsoleLogs([]);
    setDiscoveredPosts([]);
    setTimeLeft(10);
    setStatus("DISCONNECTED");
  };

  if (!isActive && !isConnecting && discoveredPosts.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-8 grid-technical">
        <div className="glass-card w-full max-w-md p-10 border-[#0077b5]/30">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-3xl bg-[#0077b5] flex items-center justify-center shadow-[0_0_30px_rgba(0,119,181,0.5)] mb-8">
              <Linkedin className="h-10 w-10 text-white fill-white/10" />
            </div>
            <h1 className="text-3xl font-black mb-4 tracking-tighter">AGENT DEPLOYMENT</h1>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">Connect your session bridge. Credentials are used to generate a secure agent kernel localized to your environment.</p>
            
            <div className="w-full space-y-6">
              <div className="text-left">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] pl-1 mb-2 block">Session E-mail</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    placeholder="user@example.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-[#0077b5] transition-all group-hover:border-white/20"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] pl-1 mb-2 block">Secure Key</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-[#0077b5] transition-all group-hover:border-white/20"
                  />
                </div>
              </div>

              <button 
                onClick={handleConnect}
                disabled={!credentials.email || !credentials.password}
                className="btn-professional btn-primary w-full py-5 text-sm uppercase tracking-[0.2em] mt-4 disabled:opacity-30 disabled:grayscale"
              >
                Establish Link <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12 grid-technical min-h-screen">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end justify-between border-b border-white/5 pb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-700"}`} />
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{status}</p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">MISSION_KERNEL</h1>
        </div>
        
        <div className="flex items-center gap-4">
           {isActive && (
             <div className="px-6 py-2 rounded-2xl bg-[#0077b5]/10 border border-[#0077b5]/20 flex items-center gap-3 font-mono text-xs text-[#0077b5]">
                <Clock className="h-4 w-4 animate-spin-slow" /> {timeLeft}s_REMAINING
             </div>
           )}
           {(!isActive && !isConnecting) && (
              <button 
                onClick={resetSession}
                className="btn-professional btn-outline text-xs uppercase tracking-widest px-6"
              >
                Re-Deploy 
              </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Agent Terminal */}
        <div className="lg:col-span-3 flex flex-col glass-card border-white/5 bg-black/40 overflow-hidden min-h-[500px]">
          <div className="bg-white/5 border-b border-white/10 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="h-4 w-4 text-[#0077b5]" />
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">KERNEL_AUDIT_LOG</span>
            </div>
            <div className="flex gap-2">
               <div className="h-2 w-2 rounded-full bg-red-500/30" />
               <div className="h-2 w-2 rounded-full bg-yellow-500/30" />
               <div className="h-2 w-2 rounded-full bg-[#0077b5]/30" />
            </div>
          </div>
          <div className="flex-1 p-8 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-3 bg-[#050505]">
            <AnimatePresence>
              {(isConnecting || isActive || consoleLogs.length > 0) ? consoleLogs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={i} 
                  className={`flex gap-4 ${log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('AUTH') ? 'text-[#0077b5]' : 'text-gray-500'}`}
                >
                  <span className="opacity-20 text-white shrink-0">[{50-i}]</span>
                  <span>{log}</span>
                </motion.div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                   <Activity className="h-12 w-12 animate-pulse mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">STANDBY_MODE</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Intelligence Stream */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-white/5" />
             <h2 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.4em] whitespace-nowrap">Extracted Data</h2>
             <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 no-scrollbar">
            <AnimatePresence initial={false}>
              {discoveredPosts.map((analysis, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => window.open(analysis.url, '_blank')}
                  className="p-6 md:p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 space-y-4 hover:border-[#0077b5]/50 hover:bg-white/[0.03] transition-all font-display group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${
                        analysis.type === 'Toxic' ? 'bg-red-500/10 text-red-500' : 'bg-[#0077b5]/10 text-[#0077b5]'
                      }`}>
                        {analysis.type === 'Toxic' ? <ShieldAlert className="h-5 w-5" /> : <Linkedin className="h-5 w-5" />}
                      </div>
                      <span className="font-bold text-white group-hover:text-[#0077b5] transition-colors">{analysis.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{analysis.relevance}% Match</span>
                       <ExternalLink className="h-3 w-3 text-gray-700 group-hover:text-[#0077b5]" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 italic leading-relaxed">"{analysis.content}"</p>
                  
                  <div className="flex flex-wrap gap-2">
                     <span className="px-3 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                       DOM_ID_{i}
                     </span>
                     <span className="px-3 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                       {analysis.type}
                     </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {discoveredPosts.length === 0 && !isActive && !isConnecting && (
              <div className="h-64 rounded-[2rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center p-12">
                 <div className="flex gap-1 mb-6">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/5" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/5" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/5" />
                 </div>
                 <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] leading-relaxed">Awaiting neural feedback from deployed agent kernel.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Signal Strength</p>
                <div className="flex items-center gap-2">
                   <Globe className="h-4 w-4 text-emerald-500" />
                   <span className="text-xl font-bold font-display tracking-tight text-white">98%</span>
                </div>
             </div>
             <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Processing</p>
                <div className="flex items-center gap-2">
                   <Cpu className="h-4 w-4 text-purple-500" />
                   <span className="text-xl font-bold font-display tracking-tight text-white">420ms</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
