"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, ShieldCheck, BarChart3, Lock, Zap, LayoutDashboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Icon3D } from "@/components/shared/icon-3d"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,95,168,0.16),_transparent_45%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-primary/10 blur-[110px] pointer-events-none translate-x-1/4 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] rounded-full bg-accent/10 blur-[110px] pointer-events-none -translate-x-1/4 translate-y-1/3" />

      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight">AuditSphere</span>
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Audit Intelligence</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="transition hover:text-primary">Features</Link>
            <Link href="#solutions" className="transition hover:text-primary">Solutions</Link>
            <Link href="#security" className="transition hover:text-primary">Security</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/60 hover:text-primary md:inline-flex">
              Sign in
            </Link>
            <Link href="/dashboard" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90">
              Enter App
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-sm text-primary">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Enterprise GRC platform now available
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Transform audit, risk, and compliance into
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> intelligent workflows</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              AuditSphere unifies internal audit, controls testing, trial balance analysis, and AI-powered findings into one modern platform — so teams can work faster, safer, and with more confidence.
            </p>

            <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/dashboard" className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto">
                Launch dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Button variant="outline" className="w-full rounded-full border border-border/80 bg-background/80 px-8 py-4 text-base text-foreground shadow-sm transition hover:bg-muted/80 sm:w-auto">
                Book a demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="mt-20 grid w-full gap-6 md:grid-cols-3"
            id="features"
          >
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card relative overflow-hidden rounded-3xl border border-border/70 p-8 shadow-sm transition hover:shadow-xl hover:border-primary/30">
                <div className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-20 ${feature.color}`} />
                <div className="relative mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/70 text-xl text-current">
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-border/30 bg-background/80 px-4 py-8 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium">AuditSphere © 2026</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
            <Link href="#" className="transition hover:text-primary">Privacy</Link>
            <Link href="#" className="transition hover:text-primary">Terms</Link>
            <Link href="#" className="transition hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "AI-Powered Intelligence",
    description: "Directly parse documents and risk data with AI to uncover issues before audit cycles begin.",
    icon: Zap,
    color: "bg-primary",
    iconColor: "text-primary"
  },
  {
    title: "Dynamic Reporting",
    description: "Create polished, branded reports in Word and Excel with data-driven narratives and audit trail confidence.",
    icon: BarChart3,
    color: "bg-accent",
    iconColor: "text-accent"
  },
  {
    title: "Enterprise Security",
    description: "Built on Supabase with Row Level Security and trusted access controls for secure audit collaboration.",
    icon: Lock,
    color: "bg-destructive",
    iconColor: "text-destructive"
  }
]
