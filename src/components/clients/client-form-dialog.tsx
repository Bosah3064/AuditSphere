"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { useClientStore, Client } from "@/store/client-store"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  industry: z.string().min(2, "Industry is required"),
  kraPin: z.string().min(5, "KRA PIN is required"),
  financialYearEnd: z.string().min(2, "Financial Year End is required"),
  status: z.enum(["Active", "Inactive"]),
  contactPerson: z.string().min(2, "Contact Person is required"),
  contactEmail: z.string().email("Invalid email address"),
})

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientToEdit?: Client | null
}

export function ClientFormDialog({
  open,
  onOpenChange,
  clientToEdit,
}: ClientFormDialogProps) {
  const { addClient, updateClient } = useClientStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      industry: "",
      kraPin: "",
      financialYearEnd: "",
      status: "Active",
      contactPerson: "",
      contactEmail: "",
    },
  })

  React.useEffect(() => {
    if (clientToEdit) {
      form.reset({
        name: clientToEdit.name,
        industry: clientToEdit.industry,
        kraPin: clientToEdit.kraPin,
        financialYearEnd: clientToEdit.financialYearEnd,
        status: clientToEdit.status,
        contactPerson: clientToEdit.contactPerson,
        contactEmail: clientToEdit.contactEmail,
      })
    } else {
      form.reset({
        name: "",
        industry: "",
        kraPin: "",
        financialYearEnd: "",
        status: "Active",
        contactPerson: "",
        contactEmail: "",
      })
    }
  }, [clientToEdit, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (clientToEdit) {
        await updateClient(clientToEdit.id, values)
      } else {
        await addClient({ ...values, lastAuditDate: "Pending" })
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{clientToEdit ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {clientToEdit
              ? "Update the details for this audit client."
              : "Register a new client for audit engagements."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Safaricom PLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Technology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kraPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KRA PIN</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. P0510..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="financialYearEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Year End</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. March 31" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
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
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. jane@company.com" {...field} />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : clientToEdit ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
