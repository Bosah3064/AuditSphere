import React from "react"
import Link from "next/link"

interface LogoProps {
  className?: string
  withText?: boolean
}

export function Logo({ className = "", withText = true }: LogoProps) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105">
        <img
          src="/logo.png"
          alt="AuditSphere Logo"
          className="h-full w-full object-cover"
        />
      </div>
      {withText && (
        <span className="font-bold text-xl tracking-tight transition-colors group-hover:text-primary">
          AuditSphere
        </span>
      )}
    </Link>
  )
}
