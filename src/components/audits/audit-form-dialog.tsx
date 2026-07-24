"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuditStore, Audit } from "@/store/audit-store"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.string().min(1, "Type is required"),
  status: z.enum(["Planning", "Fieldwork", "Review", "Reporting", "Completed"]),
  risk: z.enum(["Critical", "High", "Medium", "Low"]),
  progress: z.coerce.number().min(0).max(100),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  lead: z.string().min(2, "Lead auditor is required"),
  team: z.string().min(2, "At least one team member is required"),
})

type AuditFormValues = z.infer<typeof formSchema>

interface AuditFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditToEdit?: Audit | null
}

export function AuditFormDialog({ open, onOpenChange, auditToEdit }: AuditFormDialogProps) {
  const { addAudit, updateAudit } = useAuditStore()

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(formSchema) as Resolver<AuditFormValues>,
    defaultValues: {
      title: "",
      type: "",
      status: "Planning",
      risk: "Medium",
      progress: 0,
      startDate: "",
      endDate: "",
      lead: "",
      team: "",
    },
  })

  React.useEffect(() => {
    if (auditToEdit) {
      form.reset({
        title: auditToEdit.title,
        type: auditToEdit.type,
        status: auditToEdit.status,
        risk: auditToEdit.risk,
        progress: auditToEdit.progress,
        startDate: auditToEdit.startDate,
        endDate: auditToEdit.endDate,
        lead: auditToEdit.lead,
        team: auditToEdit.team.join(", "),
      })
    } else {
      form.reset({
        title: "",
        type: "",
        status: "Planning",
        risk: "Medium",
        progress: 0,
        startDate: "",
        endDate: "",
        lead: "",
        team: "",
      })
    }
  }, [auditToEdit, form, open])

  const onSubmit = (data: AuditFormValues) => {
    const formattedData = {
      ...data,
      team: data.team.split(",").map((t) => t.trim()).filter(Boolean),
    }

    if (auditToEdit) {
      updateAudit(auditToEdit.id, formattedData)
      onOpenChange(false)
    } else {
      addAudit(formattedData)
      // We don't close the dialog for a new entry, so it's ready to add another one
    }
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{auditToEdit ? "Edit Audit" : "Create New Audit"}</DialogTitle>
          <DialogDescription>
            {auditToEdit 
              ? "Update the details of the selected audit engagement." 
              : "Enter the details to schedule a new audit engagement."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Q4 IT General Controls" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Compliance">Compliance</SelectItem>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Strategic">Strategic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Fieldwork">Fieldwork</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Reporting">Reporting</SelectItem>
                        <SelectItem value="Complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="risk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Risk Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Auditor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Members</FormLabel>
                    <FormControl>
                      <Input placeholder="Comma separated names" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {auditToEdit ? "Save Changes" : "Create Audit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
