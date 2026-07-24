"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Bot, User, Send, Sparkles, AlertTriangle } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: string
}

const mockMessages: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "What are the key risks I should focus on for our Q3 financial audit?",
    timestamp: "10:00 AM"
  },
  {
    id: "m2",
    role: "ai",
    content: "Based on recent industry trends and your organization's risk profile, I recommend focusing on the following key risks for the Q3 financial audit:\n\n*   **Revenue Recognition:** Ensure compliance with ASC 606, particularly regarding complex multi-element arrangements.\n*   **Accounts Payable Controls:** Review segregation of duties and approval workflows to prevent unauthorized disbursements.\n*   **Manual Journal Entries:** Analyze non-standard journal entries, especially those posted on weekends or by privileged users.\n*   **System Access:** Verify that terminated employees' access to financial systems is revoked promptly.",
    timestamp: "10:01 AM"
  },
  {
    id: "m3",
    role: "user",
    content: "Can you draft an audit plan for the AP controls area?",
    timestamp: "10:05 AM"
  },
  {
    id: "m4",
    role: "ai",
    content: "**Audit Plan: Accounts Payable Controls**\n\n**Objective:** To evaluate the design and operating effectiveness of internal controls over the Accounts Payable process.\n\n**Scope:** AP transactions processed between July 1 and September 30.\n\n**Key Procedures:**\n1.  **Walkthrough:** Conduct a walkthrough of the end-to-end AP process with key personnel.\n2.  **Segregation of Duties:** Verify that individuals who can set up new vendors cannot also approve invoices or initiate payments.\n3.  **Invoice Approval:** Select a sample of 45 invoices and verify they were approved by an authorized individual in accordance with the delegation of authority matrix.\n4.  **Duplicate Payments:** Perform data analytics to identify potential duplicate payments (e.g., same vendor, invoice number, and amount).\n\n**Timeline:** 3 weeks (Planning: 2 days, Fieldwork: 2 weeks, Reporting: 3 days)",
    timestamp: "10:06 AM"
  },
  {
    id: "m5",
    role: "user",
    content: "What sample size should I use for AP testing?",
    timestamp: "10:10 AM"
  }
]

export function AIChat() {
  const [messages, setMessages] = React.useState<Message[]>(mockMessages)
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Based on AICPA guidelines for a control operating daily, a sample size of 25-40 is typically recommended, assuming a 0% expected deviation rate and a 90% confidence level. Since you mentioned selecting 45 invoices in the draft plan, that provides a conservative and statistically sound sample size for high-frequency AP transactions.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiResponse])
    }, 2500)
  }

  // Very basic markdown parsing for bold and bullet points
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let formattedLine = line
      
      // Handle bold text (**text**)
      const boldParts = formattedLine.split(/\*\*(.*?)\*\*/g)
      const renderedLine = boldParts.map((part, index) => 
        index % 2 !== 0 ? <strong key={index} className="text-foreground">{part}</strong> : part
      )

      if (line.startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc">{renderedLine}</li>
      }
      
      return <p key={i} className="mb-2">{renderedLine}</p>
    })
  }

  return (
    <Card className="flex flex-col h-full glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-muted/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-full">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">AuditSphere Assistant</h3>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI Agent Online
            </p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                {message.role === "user" ? (
                  <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-accent text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
                <div 
                  className={`px-4 py-2 rounded-2xl ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted rounded-tl-sm"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {formatContent(message.content)}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                  {message.timestamp}
                </span>
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-background">U</AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Avatar className="h-8 w-8 border bg-primary/10">
              <AvatarFallback className="bg-transparent text-primary">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          <strong>Professional Judgment Warning:</strong> This recommendation is generated using AI and should support—not replace—the professional judgment of qualified auditors. Users remain responsible for all audit conclusions and compliance with applicable auditing standards.
        </p>
      </div>

      <div className="p-4 border-t bg-background">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the AI Assistant..."
            className="min-h-[60px] max-h-[200px] resize-none pb-10"
          />
          <div className="absolute bottom-2 left-2 flex gap-1">
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs px-2 rounded-full bg-muted/50 hover:bg-muted" onClick={() => setInput("Draft an audit plan for...")}>
              Draft Plan
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs px-2 rounded-full bg-muted/50 hover:bg-muted" onClick={() => setInput("What are the risks of...")}>
              Identify Risks
            </Button>
          </div>
          <Button 
            type="submit" 
            size="icon"
            className="h-[60px] w-[60px] shrink-0 rounded-xl"
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
