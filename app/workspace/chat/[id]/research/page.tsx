"use client";

import { useParams } from "next/navigation";
import { supabase } from "@/services/SupabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ResearchLoader from "@/components/ResearchLoader";
import { 
  Download, 
  Sparkles, 
  FileText, 
  Save, 
  Edit3, 
  Eye, 
  Code, 
  X,
  Crown,
  Zap
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

const ResearchPage = () => {
  const { id } = useParams();
  const chatId = id as string;
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [sourceHtml, setSourceHtml] = useState<string>("");
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    const fetchAndGeneratePDF = async () => {
      try {
        const { data, error } = await supabase
          .from("Data")
          .select("research_paper")
          .eq("chatId", chatId)
          .eq("userEmail", userEmail)
          .maybeSingle();

        if (error || !data?.research_paper) {
          throw new Error(
            `No research paper found: ${error?.message || "Unknown error"}`
          );
        }

        let cleanedResearchPaper = data.research_paper
          .replace(/^\s*html\s*/i, "")
          .replace(/^\s*```/, "")
          .replace(/\s*```\s*$/, "")
          .replace(/^\s*<!DOCTYPE[^>]*>\s*<html[^>]*>\s*<body[^>]*>\s*/i, "")
          .replace(/\s*<\/body>\s*<\/html>\s*$/i, "")
          .trim();

        const fullHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            <link href="https://fonts.googleapis.com/css2?family=Roboto+Serif:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Roboto Serif', serif; margin: 0; padding: 40px; line-height: 1.8; color: #333; }
              h1 { text-align: center; color: #222; font-size: 2.2em; margin-bottom: 20px; }
              h2 { color: #444; font-size: 1.6em; margin: 40px 0 20px; }
              p { margin: 10px 0; }
              .abstract { padding-left: 20px; border-left: 4px solid #666; }
              table { width: 100%; border-collapse: collapse; margin: 30px 0; }
              th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: 700; }
              tr:nth-child(even) { background-color: #fafafa; }
              .section { margin-bottom: 40px; }
              ul { margin: 20px 0; padding-left: 30px; }
              li { margin-bottom: 10px; }
            </style>
          </head>
          <body>
            ${cleanedResearchPaper}
          </body>
          </html>
        `;
        setSourceHtml(fullHtml);

        const response = await fetch("/api/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: fullHtml, chatId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `PDF generation failed: ${response.status} - ${errorText}`
          );
        }

        const blob = await response.blob();
        setPdfBlob(blob);
      } catch (err: any) {
        toast.error(err.message);
        console.error("PDF generation error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndGeneratePDF();
  }, [chatId, userEmail]);

  const handleDownload = () => {
    if (!pdfBlob) {
      toast.error("No PDF available to download.");
      return;
    }
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `research-paper-${chatId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewSource = () => {
    setShowSourceDialog(true);
  };

  const handleSaveSource = async () => {
    try {
      const bodyContent =
        sourceHtml.match(/<body>([\s\S]*?)<\/body>/)?.[1] || sourceHtml;
      const cleanedBodyContent = bodyContent
        .replace(/^\s*html\s*/i, "")
        .replace(/^\s*```/, "")
        .replace(/\s*```\s*$/, "")
        .replace(/^\s*<!DOCTYPE[^>]*>\s*<html[^>]*>\s*<body[^>]*>\s*/i, "")
        .replace(/\s*<\/body>\s*<\/html>\s*$/i, "")
        .trim();

      const { error } = await supabase
        .from("Data")
        .update({ research_paper: cleanedBodyContent })
        .eq("chatId", chatId)
        .eq("userEmail", userEmail);

      if (error) {
        throw new Error(`Failed to save changes to Supabase: ${error.message}`);
      }

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: sourceHtml, chatId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `PDF regeneration failed: ${response.status} - ${errorText}`
        );
      }

      const blob = await response.blob();
      setPdfBlob(blob);
      toast.success("Changes saved and PDF updated!");
      setShowSourceDialog(false);
    } catch (err: any) {
      toast.error(err.message);
      console.error("Save source error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full text-white bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
        <ResearchLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-br from-black via-purple-950/20 to-black">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/3 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative flex flex-col items-center justify-start p-4 sm:p-8 min-h-screen">
        {/* Header */}
        <div className="w-full max-w-7xl mb-8">
          <div className="flex items-center justify-between p-6 rounded-2xl shadow-2xl backdrop-blur-xl bg-black/40 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-purple-300" />
              <h1 className="text-xl sm:text-2xl md:block hidden font-bold text-purple-100">
                Research Paper Viewer
              </h1>
            </div>

            <div className="w-16"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-7xl mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl backdrop-blur-xl bg-black/20 border border-purple-500/10">
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-xl font-semibold shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10 hidden sm:block">AI Edit Pro</span>
              <Crown className="w-4 h-4 relative z-10 text-yellow-300" />
            </button>
            
            <button
              onClick={handleViewSource}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/70 hover:to-gray-500/70 border border-gray-500/30 rounded-xl font-semibold shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <Code className="w-5 h-5" />
              <span className="hidden sm:block">View Source</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600/90 hover:to-purple-600/90 border border-indigo-500/30 rounded-xl font-semibold shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:block">Download PDF</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* HTML Source Panel */}
            <div className="rounded-2xl shadow-2xl backdrop-blur-xl bg-black/40 border border-purple-500/20 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                <Code size={20} className="text-purple-300" />
                <h2 className="text-lg font-semibold text-purple-100">HTML Source</h2>
              </div>
              <div className="p-4">
                <textarea
                  value={sourceHtml}
                  readOnly
                  className="w-full h-[600px] p-4 bg-black/60 border border-gray-700/50 rounded-xl text-sm text-green-300 font-mono resize-none focus:outline-none focus:border-purple-500/50 transition-colors scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
                  placeholder="HTML source code will appear here..."
                />
              </div>
            </div>

            {/* PDF Preview Panel */}
            <div className="rounded-2xl shadow-2xl backdrop-blur-xl bg-black/40 border border-purple-500/20 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-purple-500/20 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
                <Eye size={20} className="text-indigo-300" />
                <h2 className="text-lg font-semibold text-indigo-100">PDF Preview</h2>
              </div>
              <div className="p-4">
                {pdfBlob ? (
                  <iframe
                    title="PDF Viewer"
                    src={URL.createObjectURL(pdfBlob)}
                    width="100%"
                    height="600px"
                    className="border border-purple-500/30 rounded-xl shadow-inner bg-white"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] border border-red-500/30 rounded-xl bg-red-900/10">
                    <p className="text-red-300 text-center">
                      No PDF available to display.<br />
                      <span className="text-sm text-red-400">Please try regenerating the document.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Edit Pro Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  AI Edit Pro
                  <Crown className="w-5 h-5 text-yellow-400" />
                </h2>
                <p className="text-sm text-purple-300">Premium Feature</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">
              Experience the future of research editing:
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>🎙️ Voice-based live editing</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>🤖 Prompt-driven document rewriting</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>📄 Real-time changes as you speak</span>
              </div>
            </div>
            
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 mb-6">
              <p className="text-sm text-purple-200 text-center">
                Available for premium subscribers only
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm border border-gray-500/30 text-gray-300 hover:bg-gray-800/50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowDialog(false);
                  toast("Redirecting to subscription...");
                }}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Edit Dialog */}
      {showSourceDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 max-w-4xl w-10/12 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setShowSourceDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Edit Source HTML
              </h2>
            </div>
            
            <div className="flex-1 min-h-0">
              <textarea
                value={sourceHtml}
                onChange={(e) => setSourceHtml(e.target.value)}
                className="w-full h-full p-4 bg-black/60 border border-gray-700/50 rounded-xl text-sm text-green-300 font-mono resize-none focus:outline-none focus:border-purple-500/50 transition-colors scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
                placeholder="Edit your research paper HTML here..."
              />
            </div>
            
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-purple-500/20">
              <button
                onClick={() => setShowSourceDialog(false)}
                className="px-6 py-3 rounded-xl text-sm border border-gray-500/30 text-gray-300 hover:bg-gray-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSource}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.5);
        }

        /* Glassmorphism effects */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }
      `}</style>
    </div>
  );
};

export default ResearchPage;
