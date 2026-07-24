"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFindingStore, type Finding } from "@/store/finding-store"
import { useAuditStore } from "@/store/audit-store"

const severityOptions = ["Critical", "High", "Medium", "Low"] as const
const statusOptions = [
  "Draft",
  "Open",
  "Management Response",
  "In Remediation",
  "Closed",
] as const

const findingFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  auditId: z.string().min(1, "Audit is required"),
  severity: z.enum(severityOptions),
  status: z.enum(statusOptions),
  owner: z.string().min(1, "Owner is required"),
  dueDate: z.string().min(1, "Due date is required"),
})

type FindingFormValues = z.infer<typeof findingFormSchema>

interface FindingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  findingToEdit?: Finding | null
}

export function FindingFormDialog({
  open,
  onOpenChange,
  findingToEdit,
}: FindingFormDialogProps) {
  const { addFinding, updateFinding } = useFindingStore()
  const { audits } = useAuditStore()

  const form = useForm<FindingFormValues>({
    resolver: zodResolver(findingFormSchema),
    defaultValues: {
      title: "",
      auditId: "",
      severity: undefined,
      status: undefined,
      owner: "",
      dueDate: "",
    },
  })

  React.useEffect(() => {
    if (findingToEdit) {
      form.reset({
        title: findingToEdit.title,
        auditId: findingToEdit.auditId,
        severity: findingToEdit.severity,
        status: findingToEdit.status,
        owner: findingToEdit.owner,
        dueDate: findingToEdit.dueDate,
      })
    } else {
      form.reset({
        title: "",
        auditId: "",
        severity: undefined,
        status: undefined,
        owner: "",
        dueDate: "",
      })
    }
  }, [findingToEdit, form])

  function onSubmit(values: FindingFormValues) {
    if (findingToEdit) {
      updateFinding(findingToEdit.id, values)
    } else {
      addFinding(values)
    }
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {findingToEdit ? "Edit Finding" : "New Finding"}
          </DialogTitle>
          <DialogDescription>
            {findingToEdit
              ? "Update the finding details below."
              : "Fill in the details to create a new audit finding."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Finding title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Audit */}
            <FormField
              control={form.control}
              name="auditId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an audit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {audits.map((audit) => (
                        <SelectItem key={audit.id} value={audit.id}>
                          {audit.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Severity and Status row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {severityOptions.map((severity) => (
                          <SelectItem key={severity} value={severity}>
                            {severity}
                          </SelectItem>
                        ))}
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Owner and Due Date row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Finance Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {findingToEdit ? "Update Finding" : "Create Finding"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
