import * as React from "react"
import { AuditWorkspace } from "@/components/audits/audit-workspace"

export async function generateStaticParams() {
  return [{ id: "1" }]
}

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <AuditWorkspace auditId={id} />
    </div>
  )
}
