"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { ClipboardList, ShieldAlert, Users, Calendar, Bot, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewAuditWizard() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const totalSteps = 4

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleCreate = () => {
    // In a real app, save to Supabase here
    router.push("/audits")
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Create New Audit</h2>
        <p className="text-muted-foreground mt-2">
          Follow the wizard to set up a new audit engagement.
        </p>
      </div>

      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        {[1, 2, 3, 4].map(s => (
          <div 
            key={s} 
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
              s < step ? "bg-primary border-primary text-primary-foreground" : 
              s === step ? "bg-background border-primary text-primary" : 
              "bg-background border-muted text-muted-foreground"
            }`}
          >
            {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
          </div>
        ))}
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <p className="text-sm text-muted-foreground">Define the scope and objectives.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Audit Title</Label>
                    <Input placeholder="e.g. Q3 2026 Financial Controls" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Audit Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="it">IT / Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fiscal Year</Label>
                      <Select defaultValue="2026">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Objectives & Scope</Label>
                    <Textarea className="min-h-[100px]" placeholder="Briefly describe what this audit will cover..." />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ShieldAlert className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Risk Assessment</h3>
                      <p className="text-sm text-muted-foreground">Link relevant risks to this audit.</p>
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
                    <Bot className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">AI Suggestion Available</p>
                      <p className="text-sm text-muted-foreground">
                        Based on the selected audit type "Financial", the AI recommends linking 3 high-priority risks from the risk register.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">View Suggestions</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Primary Risk Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select overall risk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Team Assignment</h3>
                      <p className="text-sm text-muted-foreground">Assign auditors to this engagement.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Lead Auditor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah Jenkins</SelectItem>
                        <SelectItem value="david">David Chen</SelectItem>
                        <SelectItem value="michael">Michael Chang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Timeline & Review</h3>
                      <p className="text-sm text-muted-foreground">Set dates and finalize.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Target End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="rounded-xl border p-4 bg-muted/20 mt-6">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li><span className="text-foreground">Type:</span> Financial Audit</li>
                      <li><span className="text-foreground">Risk Level:</span> High</li>
                      <li><span className="text-foreground">Status:</span> Planning</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              Create Audit <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
