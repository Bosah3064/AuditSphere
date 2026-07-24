"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { motion } from "motion/react"
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWorkpaperStore, type Workpaper } from "@/store/workpaper-store"
import Link from "next/link"

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/20">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-muted' : ''}
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function WorkpaperEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { workpapers, fetchWorkpapers, updateWorkpaper, isLoading } = useWorkpaperStore()
  
  const id = params.id as string
  const workpaper = workpapers.find(w => w.id === id)

  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (workpapers.length === 0) {
      fetchWorkpapers()
    }
  }, [fetchWorkpapers, workpapers.length])

  const editor = useEditor({
    extensions: [StarterKit],
    content: workpaper?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] p-8',
      },
    },
  })

  // Update editor content when workpaper loads
  React.useEffect(() => {
    if (editor && workpaper && !editor.isDestroyed) {
      if (editor.getHTML() === '<p></p>' && workpaper.content) {
        editor.commands.setContent(workpaper.content)
      }
    }
  }, [editor, workpaper])

  if (isLoading && !workpaper) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    )
  }

  if (!workpaper) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <h2 className="text-2xl font-semibold">Document not found</h2>
        <Button onClick={() => router.push('/workpapers')}>
          Return to Workpapers
        </Button>
      </div>
    )
  }

  const handleSave = async () => {
    if (!editor) return
    
    setIsSaving(true)
    const html = editor.getHTML()
    
    try {
      await updateWorkpaper(id, { content: html })
      toast.success("Document saved successfully")
    } catch (error) {
      toast.error("Failed to save document")
    } finally {
      setIsSaving(false)
    }
  }

  const updateStatus = async (newStatus: "In Review" | "Reviewed" | "Signed Off", message: string) => {
    setIsSaving(true)
    const html = editor?.getHTML() || workpaper.content
    
    try {
      await updateWorkpaper(id, { content: html, status: newStatus })
      toast.success(message)
      if (newStatus === "Signed Off") {
        router.push("/workpapers")
      }
    } catch (error) {
      toast.error("Failed to update workflow status")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/workpapers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{workpaper.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-xs font-normal">
                {workpaper.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Linked to Audit: {workpaper.auditId}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {workpaper.status === "Draft" && (
              <Button 
                variant="outline" 
                onClick={() => updateStatus("In Review", "Submitted for review")}
                disabled={isSaving}
              >
                Send for Review
              </Button>
            )}
            
            {workpaper.status === "In Review" && (
              <Button 
                variant="outline"
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={() => updateStatus("Reviewed", "Workpaper reviewed and approved")}
                disabled={isSaving}
              >
                Review & Approve
              </Button>
            )}

            {workpaper.status === "Reviewed" && (
              <Button 
                variant="outline"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => updateStatus("Signed Off", "Partner sign-off completed")}
                disabled={isSaving}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Partner Sign-Off
              </Button>
            )}

          {workpaper.status !== "Signed Off" && (
            <Button
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 bg-primary/5 transition-colors group"
              onClick={() => {
                setIsSaving(true)
                setTimeout(() => {
                  const aiFinding = `
<h2>Audit Finding: Control Deficiency Identified</h2>
<p><strong>Condition:</strong> During our testing of control ${workpaper.title || "C-101"}, we noted exceptions in the documented evidence.</p>
<p><strong>Criteria:</strong> Company policy states that all transactions must be reviewed and signed off by a manager.</p>
<p><strong>Cause:</strong> The system does not enforce a hard stop preventing unapproved transactions from processing.</p>
<p><strong>Effect:</strong> Increased risk of unauthorized transactions leading to financial misstatement.</p>
<p><strong>Recommendation:</strong> Implement a system-level constraint requiring secondary approval for all high-value transactions.</p>
`
                  editor?.commands.insertContent(aiFinding)
                  setIsSaving(false)
                  toast.success("AI successfully drafted a finding based on your notes.")
                }, 1500)
              }}
              disabled={isSaving}
            >
              <svg className="mr-2 h-4 w-4 animate-pulse text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Auto-Draft Finding
            </Button>
          )}

          <Button 
            variant="default" 
            onClick={handleSave} 
            disabled={isSaving || workpaper.status === "Signed Off"}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Document"}
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto bg-muted/10 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-background rounded-xl border shadow-sm overflow-hidden"
        >
          {workpaper.status !== "Signed Off" && <MenuBar editor={editor} />}
          <EditorContent 
            editor={editor} 
            className={`min-h-[500px] ${workpaper.status === "Signed Off" ? "pointer-events-none opacity-80" : ""}`}
          />
        </motion.div>
      </div>
    </div>
  )
}
