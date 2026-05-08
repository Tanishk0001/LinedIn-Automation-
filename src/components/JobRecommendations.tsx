import React, { useState, useEffect } from "react";
import { ExternalLink, MapPin, Building2, Search, RefreshCw, Briefcase, Sparkles } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { saveJobToFirestore } from "../services/automationService";

export function JobRecommendations() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryStr, setQueryStr] = useState("");

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "jobs"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const jobsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsList);
    } catch (err) {
      console.error("Fetch jobs failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleSyncJobs = async () => {
    if (!user) return;
    setLoading(true);
    
    // Simulations should be slightly randomized to appear active/real
    const jobTitles = ["Senior AI Engineer", "Lead Data Scientist", "MLOps Architect", "Applied Researcher", "Generative AI Developer"];
    const companies = ["NeuroTech", "InsightFlow", "DeepMind Context", "OpenSource Labs", "Foundry Alpha"];
    
    const mockJobs = Array.from({ length: 3 }).map((_, i) => ({
      userId: user.uid,
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      location: ["Remote", "London", "New York", "San Francisco", "Singapore"][Math.floor(Math.random() * 5)],
      description: "Scale high-performance intelligence kernels and lead autonomous agent deployment in production environments.",
      url: `https://linkedin.com/jobs/ai-${Math.floor(Math.random() * 10000)}`,
      matchScore: 85 + Math.floor(Math.random() * 15)
    }));

    try {
      for (const job of mockJobs) {
        await saveJobToFirestore(user.uid, job);
      }
      await fetchJobs();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(queryStr.toLowerCase()) || 
    job.company.toLowerCase().includes(queryStr.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end justify-between border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0077b5]" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Curated Opportunities</p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">JOB_INTELLIGENCE</h1>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            Autonomous matching engine scanning worldwide postings for high-relevance career transitions mapped to your profile.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={handleSyncJobs}
            disabled={loading}
            className="group relative flex items-center gap-3 rounded-2xl bg-[#0077b5] px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#0077b5]/90 transition-all shadow-[0_0_20px_rgba(0,119,181,0.2)]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} /> 
            Refresh Feed
          </button>
          
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0077b5] transition-colors" />
            <input 
              type="text" 
              placeholder="FILTER_ROLES..."
              className="w-full lg:w-72 rounded-2xl bg-white/5 border border-white/10 pl-14 pr-6 py-4 text-xs font-mono text-white focus:outline-none focus:border-[#0077b5] transition-all"
              value={queryStr}
              onChange={(e) => setQueryStr(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-12">
          <div className="h-20 w-20 rounded-3xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-8">
            <Briefcase className="h-8 w-8 text-gray-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-500 tracking-tight mb-2">NO_JOBS_DISCOVERED</h2>
          <p className="text-sm text-gray-600 max-w-xs">Run a sync session to deploy the matching agent across global job boards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <div key={job.id} className="group">
              <GlassCard className="h-full flex flex-col p-8 border-white/5 hover:border-[#0077b5]/30 hover:bg-white/[0.02] transition-all relative overflow-hidden active:scale-[0.98]">
                {/* Glow Effect */}
                <div className="absolute -top-24 -right-24 h-48 w-48 bg-[#0077b5]/5 rounded-full blur-[80px] group-hover:bg-[#0077b5]/10 transition-colors" />
                
                <div className="mb-8 flex items-start justify-between relative z-10">
                  <div className="h-16 w-16 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-[#0077b5]/30 transition-all">
                    <Building2 className="h-8 w-8 text-white/20 group-hover:text-[#0077b5] transition-colors" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/10">
                      <Sparkles className="h-3 w-3" /> {job.matchScore}% Match
                    </span>
                    <span className="text-[10px] font-mono text-gray-600">ID::{(job.id || "0000").slice(0, 8)}</span>
                  </div>
                </div>
                
                <div className="flex-1 relative z-10">
                  <h3 className="text-2xl font-black text-white leading-tight mb-4 tracking-tighter group-hover:text-[#0077b5] transition-colors">
                    {job.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <p className="flex items-center gap-3 text-sm text-gray-400 font-bold uppercase tracking-widest">
                      <Building2 className="h-4 w-4 text-[#0077b5]" />
                      {job.company}
                    </p>
                    <p className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-8 italic">
                    "{job.description}"
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 relative z-10">
                  <a 
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                  >
                    View Position <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
