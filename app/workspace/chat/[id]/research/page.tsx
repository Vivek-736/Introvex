"use client";

import { useParams } from "next/navigation";
import { supabase } from "@/services/SupabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ResearchLoader from "@/components/ResearchLoader";

const ResearchPage = () => {
  const { id } = useParams();
  const chatId = id as string;
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndGeneratePDF = async () => {
      try {
        const { data, error } = await supabase
          .from("Data")
          .select("research_paper")
          .eq("chatId", chatId)
          .maybeSingle();

        if (error || !data?.research_paper) {
          throw new Error("No research paper found.");
        }

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
  }, [chatId]);

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `research-paper-${chatId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">📄 Research Paper Viewer</h1>

      {loading ? (
        <ResearchLoader />
      ) : pdfBlob ? (
        <>
          <iframe
            title="PDF Viewer"
            src={URL.createObjectURL(pdfBlob)}
            width="100%"
            height="600px"
            className="max-w-4xl w-full border border-purple-500 rounded-xl shadow-lg mb-4"
          ></iframe>

          <button
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            ⬇️ Download PDF
          </button>
        </>
      ) : (
        <p className="text-red-400">No PDF available to display.</p>
      )}
    </div>
  );
};

export default ResearchPage;
