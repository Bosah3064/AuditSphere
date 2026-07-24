"use client"

import * as React from "react"
import { motion } from "motion/react"
import { MoreHorizontal, Calendar, Users, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

interface AuditCardProps {
  audit: {
    id: string
    title: string
    type: string
    status: string
    progress: number
    risk: string
    startDate: string
    endDate: string
    lead: string
    team: string[]
  }
  onDelete?: (id: string) => void
}

export function AuditCard({ audit, onDelete }: AuditCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "planning": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "fieldwork": return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "review": return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "reporting": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "critical": return "text-risk-critical"
      case "high": return "text-risk-high"
      case "medium": return "text-risk-medium"
      case "low": return "text-risk-low"
      default: return "text-muted-foreground"
    }
  }

  return (
    <Card className="glass-card flex flex-col h-full hover:shadow-md transition-all group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <Badge variant="outline" className={getStatusColor(audit.status)}>
            {audit.status}
          </Badge>
          <CardTitle className="text-lg leading-tight mt-2 line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/audits/${audit.id}`} className="hover:underline">
              {audit.title}
            </Link>
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href={`/audits/${audit.id}`} className="w-full">View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/audits/${audit.id}/findings`} className="w-full">View Findings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit Audit</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pt-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          {audit.startDate} - {audit.endDate}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center">
            <AlertCircle className={`mr-2 h-4 w-4 ${getRiskColor(audit.risk)}`} />
            Risk: <span className="font-medium ml-1">{audit.risk}</span>
          </span>
          <span className="text-muted-foreground">{audit.type}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{audit.progress}%</span>
          </div>
          <Progress value={audit.progress} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 border-t flex items-center justify-between bg-muted/30">
        <div className="flex -space-x-2 overflow-hidden">
          <Avatar className="inline-block h-8 w-8 border-2 border-background">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {audit.lead.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          {audit.team.map((member, i) => (
            <Avatar key={i} className="inline-block h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">
                {member.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Link href={`/audits/${audit.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>Open</Link>
      </CardFooter>
    </Card>
  )
}
