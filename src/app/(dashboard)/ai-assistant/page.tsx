"use client"

import * as React from "react"
import { motion } from "motion/react"
import { MessageSquare, Plus, Zap, CheckCircle2, History, ShieldAlert, FileText, ClipboardList } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIChat } from "@/components/ai/ai-chat"

export default function AIAssistantPage() {
  const pastConversations = [
    { title: "Q3 Financial Risk Assessment", date: "Today, 9:41 AM" },
    { title: "Draft Finding: Access Logs", date: "Yesterday" },
    { title: "Vendor Audit Plan Outline", date: "Last Week" },
  ]

  const capabilities = [
    "Draft audit plans & scoping documents",
    "Analyze risk trends and identify anomalies",
    "Generate structured audit findings",
    "Summarize complex evidence or policies",
    "Provide sampling methodology recommendations"
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-full space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2>
          <p className="text-muted-foreground">
            Your intelligent partner for audit planning, analysis, and reporting.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 pb-4">
        {/* Left Side - Chat (70%) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 lg:w-[70%] min-h-[500px]"
        >
          <AIChat />
        </motion.div>

        {/* Right Side - Panels (30%) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-[30%] flex flex-col gap-6 overflow-y-auto pr-1"
        >
          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center">
                <Zap className="mr-2 h-4 w-4 text-accent" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-3 px-2 flex flex-col gap-2 items-center text-center">
                <ClipboardList className="h-4 w-4 text-blue-500" />
                <span className="text-sm whitespace-normal">New Audit Plan</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 px-2 flex flex-col gap-2 items-center text-center">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <span className="text-sm whitespace-normal">Risk Assessment</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 px-2 flex flex-col gap-2 items-center text-center">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span className="text-sm whitespace-normal">Generate Report</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 px-2 flex flex-col gap-2 items-center text-center">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span className="text-sm whitespace-normal">Compliance Check</span>
              </Button>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center">
                <SparklesIcon className="mr-2 h-4 w-4 text-primary" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{cap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="glass-card flex-1">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-md flex items-center">
                <History className="mr-2 h-4 w-4 text-muted-foreground" />
                Recent Chats
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {pastConversations.map((conv, i) => (
                <Button key={i} variant="ghost" className="w-full justify-start h-auto py-2 px-3">
                  <MessageSquare className="mr-3 h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm truncate w-full text-left">{conv.title}</span>
                    <span className="text-xs text-muted-foreground">{conv.date}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
