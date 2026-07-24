"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"

interface Icon3DProps {
  icon: LucideIcon
  color?: string
  bgGradient?: string
  size?: "sm" | "md" | "lg"
  className?: string
  animate?: boolean
}

const sizeMap = {
  sm: { wrapper: "w-9 h-9", icon: "h-4 w-4" },
  md: { wrapper: "w-11 h-11", icon: "h-5 w-5" },
  lg: { wrapper: "w-14 h-14", icon: "h-7 w-7" },
}

const colorPresets: Record<string, { bg: string; text: string; shadow: string; glow: string }> = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    text: "text-white",
    shadow: "shadow-blue-500/30",
    glow: "after:bg-blue-400/20",
  },
  emerald: {
    bg: "from-emerald-500 to-emerald-600",
    text: "text-white",
    shadow: "shadow-emerald-500/30",
    glow: "after:bg-emerald-400/20",
  },
  violet: {
    bg: "from-violet-500 to-violet-600",
    text: "text-white",
    shadow: "shadow-violet-500/30",
    glow: "after:bg-violet-400/20",
  },
  amber: {
    bg: "from-amber-500 to-amber-600",
    text: "text-white",
    shadow: "shadow-amber-500/30",
    glow: "after:bg-amber-400/20",
  },
  rose: {
    bg: "from-rose-500 to-rose-600",
    text: "text-white",
    shadow: "shadow-rose-500/30",
    glow: "after:bg-rose-400/20",
  },
  cyan: {
    bg: "from-cyan-500 to-cyan-600",
    text: "text-white",
    shadow: "shadow-cyan-500/30",
    glow: "after:bg-cyan-400/20",
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    text: "text-white",
    shadow: "shadow-orange-500/30",
    glow: "after:bg-orange-400/20",
  },
  indigo: {
    bg: "from-indigo-500 to-indigo-600",
    text: "text-white",
    shadow: "shadow-indigo-500/30",
    glow: "after:bg-indigo-400/20",
  },
}

/**
 * Icon3D — A premium 3D-style icon component with gradient backgrounds,
 * depth shadows, and optional glow animation.
 * 
 * Usage:
 * <Icon3D icon={ShieldCheck} color="blue" size="lg" animate />
 */
export function Icon3D({
  icon: IconComponent,
  color = "blue",
  size = "md",
  className = "",
  animate = false,
}: Icon3DProps) {
  const preset = colorPresets[color] || colorPresets.blue
  const s = sizeMap[size]

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        ${s.wrapper}
        rounded-xl
        bg-gradient-to-br ${preset.bg}
        ${preset.text}
        shadow-lg ${preset.shadow}
        transform perspective-[800px] rotateX-[2deg]
        transition-all duration-300
        ${animate ? "hover:scale-110 hover:shadow-xl hover:-translate-y-0.5" : ""}
        after:absolute after:inset-0 after:rounded-xl ${preset.glow} after:blur-lg after:-z-10
        before:absolute before:inset-[1px] before:rounded-[10px] before:bg-gradient-to-b before:from-white/20 before:to-transparent before:z-10
        ${className}
      `}
    >
      <IconComponent className={`${s.icon} relative z-20 drop-shadow-sm`} />
    </div>
  )
}

/**
 * StatIcon3D — A specialized 3D icon for dashboard stat cards
 * with a floating glass effect and pulse animation.
 */
export function StatIcon3D({
  icon: IconComponent,
  color = "blue",
  className = "",
}: {
  icon: LucideIcon
  color?: string
  className?: string
}) {
  const preset = colorPresets[color] || colorPresets.blue

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        w-12 h-12
        rounded-2xl
        bg-gradient-to-br ${preset.bg}
        ${preset.text}
        shadow-lg ${preset.shadow}
        transition-all duration-500
        after:absolute after:inset-0 after:rounded-2xl ${preset.glow} after:blur-xl after:-z-10
        before:absolute before:inset-[1px] before:rounded-[14px] before:bg-gradient-to-b before:from-white/25 before:to-transparent before:z-10
        group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3
        ${className}
      `}
    >
      <IconComponent className="h-6 w-6 relative z-20 drop-shadow-md" />
    </div>
  )
}

/**
 * GlowBadge — A 3D badge with glow effect for status indicators
 */
export function GlowBadge({
  children,
  color = "blue",
  className = "",
}: {
  children: React.ReactNode
  color?: string
  className?: string
}) {
  const glowColors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20 shadow-blue-500/10",
    emerald: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 shadow-emerald-500/10",
    rose: "bg-rose-500/10 text-rose-600 ring-rose-500/20 shadow-rose-500/10",
    amber: "bg-amber-500/10 text-amber-600 ring-amber-500/20 shadow-amber-500/10",
    violet: "bg-violet-500/10 text-violet-600 ring-violet-500/20 shadow-violet-500/10",
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        rounded-full text-xs font-medium
        ring-1 ring-inset
        shadow-sm
        ${glowColors[color] || glowColors.blue}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
      {children}
    </span>
  )
}
