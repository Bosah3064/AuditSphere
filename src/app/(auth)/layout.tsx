import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Logo } from "@/components/shared/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left section - Branding/Image */}
      <div className="relative hidden md:flex flex-col bg-[#0A0F1C] p-12 text-white overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20 z-0" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-2000 z-0" />

        <div className="relative z-10 flex items-center text-lg font-medium">
          <Logo className="text-white" />
        </div>
        
        <div className="relative z-10 mt-auto max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-2xl font-medium leading-snug tracking-tight text-slate-100">
              &ldquo;AuditSphere has completely transformed how our internal audit team operates. We've reduced planning time by 40% and our AI-assisted findings are incredibly accurate.&rdquo;
            </p>
            <footer className="text-base text-slate-400 font-medium flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                SJ
              </div>
              <div className="flex flex-col">
                <span className="text-white">Sarah Jenkins</span>
                <span className="text-sm">Chief Audit Executive</span>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
      
      {/* Right section - Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px] z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
