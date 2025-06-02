"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, MessageSquare, FileText, Trash2, File, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

type Document = {
  id: string
  name: string
  content: string
  type: string
  url?: string
  size: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function WorkspacePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeDocument, setActiveDocument] = useState<Document | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsLoading(true)

    const newDocs: Document[] = await Promise.all(
      Array.from(files).map(async (file) => {
        const fileUrl = file.type === "application/pdf" ? URL.createObjectURL(file) : undefined
        return new Promise<Document>((resolve) => {
          if (file.type === "application/pdf") {
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              content: "",
              type: file.type,
              url: fileUrl,
              size: formatFileSize(file.size),
            })
          } else {
            const reader = new FileReader()
            reader.onload = (e) => {
              const content = e.target?.result as string
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                content,
                type: file.type,
                size: formatFileSize(file.size),
              })
            }
            reader.onerror = () => {
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                content: "Error reading file",
                type: file.type,
                size: formatFileSize(file.size),
              })
            }
            reader.readAsText(file)
          }
        })
      })
    )

    setDocuments((prev) => [...prev, ...newDocs])
    setIsLoading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [formatFileSize])

  const removeDocument = useCallback((id: string) => {
    const docToRemove = documents.find((doc) => doc.id === id)
    if (docToRemove?.url) {
      URL.revokeObjectURL(docToRemove.url)
    }

    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    if (activeDocument?.id === id) {
      setActiveDocument(null)
    }
  }, [activeDocument])

  const openDocument = useCallback((doc: Document) => {
    setActiveDocument(doc)
  }, [])

  const closeDocument = useCallback(() => {
    setActiveDocument(null)
  }, [])

  const sendMessage = useCallback(async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsLoading(true)

    // Simulate AI response (replace with actual API call when ready)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `I can help you analyze your documents. ${activeDocument ? `I see you have "${activeDocument.name}" open. ` : ""}Please integrate your Gemini API key to enable full AI capabilities.`,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, aiMessage])
    setIsLoading(false)
  }, [chatInput, activeDocument])

  const getFileIcon = useCallback((type: string) => {
    if (type === "application/pdf") {
      return <File className="h-4 w-4 text-red-600" aria-hidden="true" />
    }
    return <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
  }, [])

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant={isChatOpen ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="h-8 px-3"
            aria-label={isChatOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="ml-2 text-sm">AI Assistant</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-gray-600" aria-live="polite">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Workspace</span>
          <UserButton />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="h-8 px-3"
                aria-label="Upload documents"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.doc,.docx"
              aria-label="File upload input"
            />
            <p className="text-xs text-gray-500">Supports PDF, text files, and code files</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No documents</h3>
                  <p className="text-xs text-gray-500 mb-4">Upload your first document to get started</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8"
                    aria-label="Upload first document"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      className={cn(
                        "group flex items-center justify-between p-2 rounded-lg border w-full text-left",
                        activeDocument?.id === doc.id
                          ? "bg-white border-blue-400"
                          : "bg-gray-50 border-gray-200"
                      )}
                      onClick={() => openDocument(doc)}
                      aria-label={`Open document ${doc.name}`}
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.type)}
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {doc.name.length > 18 ? `${doc.name.substring(0, 18)}...` : doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.size} • {doc.type === "application/pdf" ? "PDF" : "Text"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeDocument(doc.id)
                        }}
                        aria-label={`Remove document ${doc.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeDocument ? (
            <div className="flex-1 flex flex-col">
              <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {getFileIcon(activeDocument.type)}
                  <div>
                    <span className="text-sm font-medium text-gray-900">{activeDocument.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({activeDocument.size})</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDocument}
                  className="h-8 w-8 p-0"
                  aria-label={`Close document ${activeDocument.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeDocument.type === "application/pdf" ? (
                  <iframe
                    src={activeDocument.url}
                    className="w-full h-full border-0"
                    title={activeDocument.name}
                    aria-label={`PDF viewer for ${activeDocument.name}`}
                  />
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <pre
                        className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed"
                        aria-label={`Content of ${activeDocument.name}`}
                      >
                        {activeDocument.content}
                      </pre>
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Eye className="h-10 w-10 text-gray-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to view documents</h3>
                <p className="text-gray-500 mb-6">
                  Select a document from the sidebar to view its contents, or upload new files to get started.
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-6"
                  aria-label="Upload documents"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {isChatOpen && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-600" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-900">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Close AI Assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">AI Assistant Ready</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Ask about your documents or get help with your research
                    </p>
                    {activeDocument && (
                      <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                        Currently viewing: {activeDocument.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4" role="log" aria-live="polite">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "p-3 rounded-lg text-sm",
                          message.role === "user"
                            ? "bg-blue-50 text-blue-900 ml-6 border border-blue-100"
                            : "bg-white text-gray-900 mr-6 border border-gray-200 shadow-sm"
                        )}
                        role="article"
                        aria-label={`${message.role === "user" ? "User" : "AI Assistant"} message`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-xs">
                            {message.role === "user" ? "You" : "AI Assistant"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="leading-relaxed">{message.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask AI"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                  className="flex-1 h-9"
                  aria-label="Chat input"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="h-9 rounded-lg px-4"
                  disabled={isLoading}
                  aria-label="Send message"
                >
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              </div>
              {activeDocument && (
                <p className="text-xs text-gray-500 mt-2" aria-live="polite">
                  Context: {activeDocument.name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}