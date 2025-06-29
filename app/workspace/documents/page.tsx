"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/SupabaseClient";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

type DocumentEntry = {
  chatId: string;
  research_paper: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from("Data")
        .select("chatId, research_paper")
        .eq('userEmail', userEmail)

      if (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents.");
      } else {
        setDocuments(data || []);
      }

      setLoading(false);
    };

    fetchDocuments();
  }, []);

  const handleOpen = (chatId: string) => {
    router.push(`/workspace/chat/${chatId}/research`);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">📁 Your Documents</h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-center text-gray-500">No documents found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {documents.map((doc, i) => {
            const preview =
              doc.research_paper?.split("\n").find((line) => line.trim()) ||
              "Document not generated yet.";
            return (
              <div
                key={doc.chatId}
                onClick={() => handleOpen(doc.chatId)}
                className="cursor-pointer bg-gray-800 hover:bg-gray-700 p-5 rounded-lg shadow transition-all"
              >
                <h2 className="text-lg font-semibold mb-2">
                  {`Document ${i + 1}`}
                </h2>
                <p className="text-sm text-gray-300 line-clamp-3">{preview}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}