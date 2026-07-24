"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Lightbulb, ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AIInsights() {
  const insights = [
    {
      id: 1,
      title: "Potential Duplicate Vendors",
      description: "Analysis of Q2 AP data shows 3 potential duplicate vendor records with conflicting payment terms.",
      action: "Review Vendors",
    },
    {
      id: 2,
      title: "Control Deficiency Trend",
      description: "IT General Controls related to user access de-provisioning have failed in 3 consecutive audits.",
      action: "Draft Finding",
    }
  ]

  return (
    <Card className="col-span-1 lg:col-span-2 relative overflow-hidden border-accent/20">
      {/* Background glowing effect for AI feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-accent/10 rounded-full">
            <Lightbulb className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Insights</CardTitle>
            <CardDescription>Generated from recent platform activity</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="group p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors"
          >
            <h4 className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors">
              {insight.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {insight.description}
            </p>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-8">
              {insight.action}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
