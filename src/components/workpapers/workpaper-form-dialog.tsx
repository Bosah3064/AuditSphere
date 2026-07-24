"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

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
import { useWorkpaperStore, type Workpaper } from "@/store/workpaper-store"
import { useAuditStore } from "@/store/audit-store"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  auditId: z.string().min(1, "Please select an audit to link to"),
})

interface WorkpaperFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkpaperFormDialog({
  open,
  onOpenChange,
}: WorkpaperFormDialogProps) {
  const router = useRouter()
  const { addWorkpaper } = useWorkpaperStore()
  const { audits, fetchAudits } = useAuditStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      fetchAudits()
    }
  }, [open, fetchAudits])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      auditId: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    const newId = await addWorkpaper({
      title: values.title,
      auditId: values.auditId,
      content: "",
      status: "Draft",
    })
    
    setIsSubmitting(false)
    onOpenChange(false)
    
    if (newId) {
      // Redirect to the rich text editor
      router.push(`/workpapers/${newId}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workpaper</DialogTitle>
          <DialogDescription>
            Workpapers are used to document audit fieldwork, evidence, and conclusions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workpaper Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Q3 Access Review Testing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="auditId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Audit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create & Edit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
