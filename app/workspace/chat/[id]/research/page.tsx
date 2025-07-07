"use client";

import { useParams } from "next/navigation";
import { supabase } from "@/services/SupabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ResearchLoader from "@/components/ResearchLoader";
import { Download, Sparkles, FileText, Save } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const ResearchPage = () => {
  const { id } = useParams();
  const chatId = id as string;
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [sourceLatex, setSourceLatex] = useState<string>("");
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
          throw new Error("No research paper found.");
        }

        setSourceLatex(data.research_paper);

        const response = await fetch("/api/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latex: data.research_paper, chatId }),
        });

        if (!response.ok) {
          throw new Error("PDF generation failed.");
        }

        const blob = await response.blob();
        setPdfBlob(blob);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAndGeneratePDF();
  }, [chatId, userEmail]);

  const handleDownload = () => {
    if (!pdfBlob) return;
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
      const { error } = await supabase
        .from("Data")
        .update({ research_paper: sourceLatex })
        .eq("chatId", chatId)
        .eq("userEmail", userEmail);

      if (error) {
        throw new Error("Failed to save changes to Supabase.");
      }

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex: sourceLatex, chatId }),
      });

      if (!response.ok) {
        throw new Error("PDF regeneration failed.");
      }

      const blob = await response.blob();
      setPdfBlob(blob);
      toast.success("Changes saved and PDF updated!");
      setShowSourceDialog(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black w-full text-white flex flex-col items-center p-6 relative">
      {loading ? (
        <ResearchLoader />
      ) : (
        <>
          <h1 className="md:text-3xl text-lg font-bold mb-4 mt-4">
            📄 Research Paper Viewer
          </h1>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg animate-pulse hover:animate-none hover:brightness-110 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span className="md:flex hidden">AI Edit</span>
            </button>
            <button
              onClick={handleViewSource}
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-gray-600 transition-all"
            >
              <FileText className="w-5 h-5" />
              <span className="md:flex hidden">View Source</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-purple-500 transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="md:flex hidden">Download PDF</span>
            </button>
          </div>

          <div className="flex w-full max-w-6xl gap-4">
            <div className="w-1/2">
              <h2 className="text-xl font-bold mb-2">LaTeX Source</h2>
              <textarea
                value={sourceLatex}
                readOnly
                className="w-full h-[600px] p-4 border border-gray-200 rounded-lg text-sm text-black bg-white resize-none font-mono"
                placeholder="LaTeX source code..."
              />
            </div>
            <div className="w-1/2">
              <h2 className="text-xl font-bold mb-2">PDF Preview</h2>
              {pdfBlob ? (
                <iframe
                  title="PDF Viewer"
                  src={URL.createObjectURL(pdfBlob)}
                  width="100%"
                  height="600px"
                  className="border border-purple-500 rounded-xl shadow-lg"
                ></iframe>
              ) : (
                <p className="text-red-400">No PDF available to display.</p>
              )}
            </div>
          </div>
        </>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="text-xl font-bold mb-2 text-purple-700">
              ✨ AI Edit (Pro)
            </h2>
            <p className="text-sm mb-4">
              Experience the future of research editing:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-800 mb-4">
              <li>🎙️ Voice-based live editing</li>
              <li>🤖 Prompt-driven document rewriting</li>
              <li>📄 See real-time changes as you speak</li>
            </ul>
            <p className="text-sm text-gray-600">
              This feature is available for premium subscribers only.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-400 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDialog(false);
                  toast("Redirecting to subscription...");
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showSourceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-xl p-8 max-w-2xl w-full shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4 text-black">
              Edit Source LaTeX
            </h2>
            <textarea
              value={sourceLatex}
              onChange={(e) => setSourceLatex(e.target.value)}
              className="w-full h-96 p-4 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y font-mono"
              placeholder="Edit your research paper LaTeX here..."
            />
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowSourceDialog(false)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-400 text-black bg-white hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSource}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPage;
