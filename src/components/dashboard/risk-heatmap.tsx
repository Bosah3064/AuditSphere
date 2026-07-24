"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useAppStore } from "@/store/app-store"

export function RiskHeatmap() {
  const { risks: dbRisks } = useAppStore()
  
  // Format risks to aggregate by cell if they share the same title
  // Or just count them directly
  const mappedRisks = dbRisks.map(r => ({
    id: r.id,
    title: r.title,
    impact: r.impact,
    likelihood: r.likelihood,
    count: 1
  }))
  
  // 5x5 grid: Likelihood (y) x Impact (x)
  const risks = mappedRisks.length > 0 ? mappedRisks : [
    { id: 'mock1', title: "No Risks Identified", impact: 1, likelihood: 1, count: 1 }
  ]

  const getCellColor = (impact: number, likelihood: number) => {
    const score = impact * likelihood
    if (score >= 20) return "bg-risk-critical"
    if (score >= 12) return "bg-risk-high"
    if (score >= 6) return "bg-risk-medium"
    return "bg-risk-low"
  }

  const getRisksInCell = (impact: number, likelihood: number) => {
    return risks.filter(r => r.impact === impact && r.likelihood === likelihood)
  }

  return (
    <Card className="glass-card col-span-1 lg:col-span-3 h-full">
      <CardHeader>
        <CardTitle>Risk Heat Map</CardTitle>
        <CardDescription>Enterprise risk distribution based on current assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center w-full h-[300px] mt-4">
          <div className="relative w-full max-w-[400px] aspect-square flex">
            {/* Y Axis Label */}
            <div className="absolute -left-12 top-0 bottom-0 flex items-center justify-center">
              <span className="-rotate-90 text-sm font-medium text-muted-foreground whitespace-nowrap">
                Likelihood
              </span>
            </div>
            
            {/* Y Axis Grid */}
            <div className="flex flex-col justify-between pr-2 h-full py-4 text-xs text-muted-foreground">
              <span>5</span>
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
            </div>
            
            {/* Heat Map Grid */}
            <div className="flex-1 grid grid-cols-5 grid-rows-5 gap-1 border-l border-b border-border p-1">
              {[5, 4, 3, 2, 1].map((likelihood) => (
                [1, 2, 3, 4, 5].map((impact) => {
                  const cellRisks = getRisksInCell(impact, likelihood)
                  const totalCount = cellRisks.reduce((sum, r) => sum + r.count, 0)
                  
                  return (
                    <Tooltip key={`${impact}-${likelihood}`}>
                      <TooltipTrigger 
                        render={
                          <motion.div 
                            className={`relative w-full h-full rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer ${getCellColor(impact, likelihood)}`}
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.8 }}
                            transition={{ delay: (impact + (5 - likelihood)) * 0.05 }}
                          >
                            {totalCount > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-bold text-xs drop-shadow-md">
                                  {totalCount}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        }
                      />
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            Impact: {impact} | Likelihood: {likelihood}
                          </p>
                          {cellRisks.length > 0 ? (
                            <ul className="text-xs list-disc pl-4 space-y-1">
                              {cellRisks.map(r => (
                                <li key={r.id}>{r.title} ({r.count})</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground">No risks identified</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })
              ))}
            </div>
            
            {/* X Axis Grid */}
            <div className="absolute -bottom-6 left-6 right-0 flex justify-between px-4 text-xs text-muted-foreground">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            
            {/* X Axis Label */}
            <div className="absolute -bottom-12 left-6 right-0 flex justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                Impact
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
