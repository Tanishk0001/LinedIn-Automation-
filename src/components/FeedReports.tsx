import React, { useState, useEffect } from "react";
import { Filter, Search, Trash2, ShieldAlert, GraduationCap, Users, RefreshCw, X, FileText as FileTextIcon, ExternalLink } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { collection, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { saveLogToFirestore } from "../services/automationService";

export function FeedReports() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "logs"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const logsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsList);
    } catch (err) {
      console.error("Fetch logs failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleSimulateAnalysis = async () => {
    if (!user) return;
    setLoading(true);
    
    const authors = ["Jane Tech", "Startup Sam", "HR Global", "Bot Account", "Cloud Architect", "ML Researcher"];
    const categories = ["Technical", "Motivational", "Hiring", "Toxic", "Technical", "Hiring"];
    const contents = [
      "Deep dive into React 19 concurrent features.",
      "Why networking is the only skill that matters.",
      "Opening for AI Research Scientist in Singapore.",
      "CRYPTO MOON 1000X JOIN TELEGRAM NOW!!!",
      "Deploying high-availability Postgres on Kubernetes.",
      "Looking for LLM engineers with Jax experience."
    ];

    const mockPosts = Array.from({ length: 3 }).map((_, i) => {
      const idx = Math.floor(Math.random() * authors.length);
      return { 
        userId: user.uid, 
        author: authors[idx], 
        type: categories[idx] as any, 
        content: contents[idx], 
        relevance: 10 + Math.floor(Math.random() * 90), 
        url: "https://www.linkedin.com/feed/", 
        createdAt: Timestamp.now() 
      };
    });

    try {
      for (const post of mockPosts) {
        await saveLogToFirestore(user.uid, post);
      }
      await fetchLogs();
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = logs.filter(p => filter === "All" || p.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Technical": return <GraduationCap className="h-4 w-4 text-blue-400" />;
      case "Hiring": return <Users className="h-4 w-4 text-emerald-400" />;
      case "Toxic": return <ShieldAlert className="h-4 w-4 text-red-400" />;
      default: return <FileTextIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0077b5]" />
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#0077b5]/10 flex items-center justify-center border border-[#0077b5]/20">
                      <ShieldAlert className="h-6 w-6 text-[#0077b5]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Report</h2>
                      <p className="text-xs text-gray-500 font-mono">HASH::{selectedLog.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-white transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Source Agent</p>
                      <p className="text-white font-bold">{selectedLog.author}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Relevance Score</p>
                      <p className={`text-xl font-black ${selectedLog.relevance > 70 ? "text-emerald-400" : "text-red-400"}`}>
                        {selectedLog.relevance}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-3">Intelligence Summary</p>
                    <p className="text-gray-300 leading-relaxed italic">"{selectedLog.content}"</p>
                  </div>

                  <div className="rounded-2xl bg-[#0077b5]/10 p-6 border border-[#0077b5]/20">
                     <p className="text-sm text-[#0077b5] font-bold mb-2">Automated Next Step:</p>
                     <p className="text-sm text-gray-300">
                       {selectedLog.type === 'Hiring' ? 'System has queued a personalized connection request to this lead.' : 'Post flagged for low relevance. Feed visibility reduced by 40%.'}
                     </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Logs</h1>
          <p className="text-gray-400">Archived feed analysis from the last sessions.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleSimulateAnalysis}
             disabled={loading}
             className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
           >
             <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Run Analysis Session
           </button>
           <button className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
             <Trash2 className="h-4 w-4" /> Clear Logs
           </button>
        </div>
      </div>

      <GlassCard className="p-0">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex gap-2">
            {["All", "Technical", "Hiring", "Motivational", "Toxic"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  filter === f ? "bg-white text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            COUNT: {filteredPosts.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] text-xs font-bold uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Intelligence Summary</th>
                <th className="px-6 py-4">Relevance</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="group hover:bg-white/[0.02] transition-colors leading-relaxed">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{post.author}</p>
                    <p className="text-[10px] text-gray-500">Extracted 2h ago</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(post.type)}
                      <span className="text-sm font-medium text-gray-300">{post.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400 line-clamp-1 italic">"{post.content}"</p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-mono ${post.relevance > 70 ? "text-emerald-400" : post.relevance > 40 ? "text-yellow-400" : "text-red-400"}`}>
                      {post.relevance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => window.open(post.url || 'https://linkedin.com', '_blank')}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-[#0077b5] hover:border-[#0077b5]/30 transition-all"
                        title="View Original Post"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setSelectedLog(post)}
                        className="text-xs font-bold text-blue-400 hover:underline"
                      >
                        Inspect Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
