import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, getDocs, query, where, serverTimestamp, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PostAnalysis {
  author: string;
  type: "Technical" | "Hiring" | "Motivational" | "Toxic";
  content: string;
  relevance: number;
  url: string;
}

export async function analyzeLinkedInPost(postContent: string): Promise<PostAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this LinkedIn post and extract the author, categorize it, summarize the content, and give a relevance score (0-100) for a Data Science/AI professional. 
      Toxicity check: If it's crypto spam, engagement bait, or low-value noise, mark as "Toxic".
      
      Post: ${postContent}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            author: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Technical", "Hiring", "Motivational", "Toxic"] },
            content: { type: Type.STRING, description: "One sentence summary" },
            relevance: { type: Type.NUMBER },
            url: { type: Type.STRING, description: "A simulated link to the original post on linkedin.com/feed/update/..." }
          },
          required: ["author", "type", "content", "relevance", "url"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    // Ensure URL is at least linkedin.com if missing
    if (!result.url) result.url = "https://www.linkedin.com/feed/";
    return result as PostAnalysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      author: "Unknown Source",
      type: "Toxic",
      content: "Failed to analyze post intelligence.",
      relevance: 0,
      url: "https://www.linkedin.com/feed/"
    };
  }
}

export async function saveLogToFirestore(userId: string, analysis: PostAnalysis) {
  try {
    // Check for duplicates (same content and author for this user)
    const logsRef = collection(db, "logs");
    const q = query(
      logsRef, 
      where("userId", "==", userId), 
      where("content", "==", analysis.content),
      where("author", "==", analysis.author),
      limit(1)
    );
    const existing = await getDocs(q);
    
    if (existing.empty) {
      await addDoc(logsRef, {
        ...analysis,
        userId,
        createdAt: serverTimestamp()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Save log failed:", error);
    return false;
  }
}

export async function saveJobToFirestore(userId: string, job: any) {
  try {
    const jobsRef = collection(db, "jobs");
    const q = query(
      jobsRef,
      where("userId", "==", userId),
      where("title", "==", job.title),
      where("company", "==", job.company),
      limit(1)
    );
    const existing = await getDocs(q);

    if (existing.empty) {
      await addDoc(jobsRef, {
        ...job,
        userId,
        createdAt: serverTimestamp()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Save job failed:", error);
    return false;
  }
}

// Mock Feed Generator for Automation Simulation
export const MOCK_FEED = [
  "Just launched our new open-source LLM framework for distributed training! Check the repo for benchmarks.",
  "I'm hiring a Senior Data Scientist to lead our NLP team in London. DM for details.",
  "Your network is your net worth. Wake up at 4 AM and hustle. #GRINDSET",
  "FREE BITCOIN GIVEAWAY! CLICK THIS SUSPICIOUS LINK NOW 🚀🚀🚀",
  "Standardizing vector database schemas is the next big hurdle in AI infrastructure. My latest thoughts...",
  "Looking for an intern who knows PyTorch and can start immediately.",
  "Why I left my $500k job at Big Tech to find my soul while doing pushups.",
];
