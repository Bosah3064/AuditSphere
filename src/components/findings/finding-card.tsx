"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Calendar, AlertTriangle, Bot, MessageSquare, MoreHorizontal, Edit, Trash2 } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Finding } from "@/store/finding-store"

interface FindingCardProps {
  finding: Finding
  onEdit?: (finding: Finding) => void
  onDelete?: (id: string) => void
}

export function FindingCard({ finding, onEdit, onDelete }: FindingCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "text-risk-critical border-risk-critical bg-risk-critical/10"
      case "high": return "text-risk-high border-risk-high bg-risk-high/10"
      case "medium": return "text-risk-medium border-risk-medium bg-risk-medium/10"
      case "low": return "text-risk-low border-risk-low bg-risk-low/10"
      default: return "text-muted-foreground border-muted bg-muted/10"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft": return "bg-slate-500/10 text-slate-500"
      case "open": return "bg-red-500/10 text-red-500"
      case "management response": return "bg-amber-500/10 text-amber-500"
      case "in remediation": return "bg-blue-500/10 text-blue-500"
      case "closed": return "bg-emerald-500/10 text-emerald-500"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="glass-card hover:shadow-md transition-shadow border-l-4 border-l-primary group">
      <CardHeader className="p-4 pb-2 space-y-2 relative">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={getSeverityColor(finding.severity)}>
            {finding.severity}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{finding.id.toUpperCase()}</span>
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-6 w-6 p-0" })}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => onEdit?.(finding)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Finding
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete?.(finding.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Finding
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardTitle className="text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors pr-6">
          {finding.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-0 space-y-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          Due: {finding.dueDate}
        </div>
        
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
            {finding.auditId.toUpperCase()}
          </Badge>
          <Badge variant="outline" className={`text-[10px] font-normal px-1.5 py-0 ${getStatusColor(finding.status)}`}>
            {finding.status}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
              {finding.owner.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {finding.owner}
          </span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MessageSquare className="h-3 w-3 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Bot className="h-3 w-3 text-accent" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
