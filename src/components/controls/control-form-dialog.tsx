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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useControlStore, type Control } from "@/store/control-store"
import { useRiskStore } from "@/store/risk-store"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  type: z.enum(["Preventive", "Detective", "Corrective"]),
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Annual", "As Needed"]),
  status: z.enum(["Effective", "Ineffective", "Not Tested"]),
  owner: z.string().min(2, "Owner is required"),
  riskId: z.string().optional(),
})

interface ControlFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  controlToEdit?: Control | null
}

export function ControlFormDialog({
  open,
  onOpenChange,
  controlToEdit,
}: ControlFormDialogProps) {
  const { addControl, updateControl } = useControlStore()
  const { risks, fetchRisks } = useRiskStore()

  React.useEffect(() => {
    if (open) {
      fetchRisks()
    }
  }, [open, fetchRisks])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "Preventive",
      frequency: "Monthly",
      status: "Not Tested",
      owner: "",
      riskId: "none",
    },
  })

  React.useEffect(() => {
    if (controlToEdit) {
      form.reset({
        title: controlToEdit.title,
        description: controlToEdit.description || "",
        type: controlToEdit.type,
        frequency: controlToEdit.frequency,
        status: controlToEdit.status,
        owner: controlToEdit.owner,
        riskId: controlToEdit.riskId || "none",
      })
    } else {
      form.reset({
        title: "",
        description: "",
        type: "Preventive",
        frequency: "Monthly",
        status: "Not Tested",
        owner: "",
        riskId: "none",
      })
    }
  }, [controlToEdit, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const submitValues = {
      ...values,
      riskId: values.riskId === "none" ? undefined : values.riskId,
    }
    
    if (controlToEdit) {
      await updateControl(controlToEdit.id, submitValues)
    } else {
      await addControl(submitValues)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {controlToEdit ? "Edit Control" : "Add New Control"}
          </DialogTitle>
          <DialogDescription>
            {controlToEdit
              ? "Update the details of this control."
              : "Create a new control and optionally link it to a risk."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Control Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Daily Data Backup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe what this control does..." 
                      className="resize-none" 
                      {...field} 
                    />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Preventive">Preventive</SelectItem>
                        <SelectItem value="Detective">Detective</SelectItem>
                        <SelectItem value="Corrective">Corrective</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                        <SelectItem value="As Needed">As Needed</SelectItem>
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
                        <SelectItem value="Effective">Effective</SelectItem>
                        <SelectItem value="Ineffective">Ineffective</SelectItem>
                        <SelectItem value="Not Tested">Not Tested</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Control Owner</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="riskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Risk (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Link to a risk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {risks.map((risk) => (
                        <SelectItem key={risk.id} value={risk.id}>
                          {risk.title}
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
              >
                Cancel
              </Button>
              <Button type="submit">
                {controlToEdit ? "Save Changes" : "Add Control"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
