"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "table-row" | "circle"
}

/**
 * Skeleton — Premium shimmer loading animation component.
 * Replaces "Loading..." text with beautiful animated placeholders.
 */
export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        variant === "circle" && "rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * TableSkeleton — Full table loading skeleton with header and rows
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3 p-4">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`r-${i}`} className="flex gap-4 pt-3 border-t border-muted/30">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={`c-${i}-${j}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * CardSkeleton — Dashboard stat card loading skeleton
 */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" variant="default" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

/**
 * PageHeaderSkeleton — Page title and action bar skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  )
}
