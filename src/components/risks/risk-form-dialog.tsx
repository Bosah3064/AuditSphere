"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Bot } from "lucide-react"

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
import { useRiskStore, Risk } from "@/store/risk-store"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  impact: z.coerce.number().min(1).max(5),
  likelihood: z.coerce.number().min(1).max(5),
  owner: z.string().min(2, "Owner name is required"),
  status: z.enum(["Open", "Mitigated", "Accepted", "Closed"]),
})

type RiskFormValues = z.infer<typeof formSchema>

interface RiskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  riskToEdit?: Risk | null
}

export function RiskFormDialog({ open, onOpenChange, riskToEdit }: RiskFormDialogProps) {
  const { addRisk, updateRisk } = useRiskStore()

  const form = useForm<RiskFormValues>({
    resolver: zodResolver(formSchema) as Resolver<RiskFormValues>,
    defaultValues: {
      title: "",
      category: "",
      impact: 3,
      likelihood: 3,
      owner: "",
      status: "Open",
    },
  })

  // Update default values when editing a risk
  React.useEffect(() => {
    if (riskToEdit) {
      form.reset({
        title: riskToEdit.title,
        category: riskToEdit.category,
        impact: riskToEdit.impact,
        likelihood: riskToEdit.likelihood,
        owner: riskToEdit.owner,
        status: riskToEdit.status,
      })
    } else {
      form.reset({
        title: "",
        category: "",
        impact: 3,
        likelihood: 3,
        owner: "",
        status: "Open",
      })
    }
  }, [riskToEdit, form, open])

  const onSubmit = (data: RiskFormValues) => {
    if (riskToEdit) {
      updateRisk(riskToEdit.id, data)
    } else {
      addRisk(data)
    }
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{riskToEdit ? "Edit Risk" : "Create New Risk"}</DialogTitle>
          <DialogDescription>
            {riskToEdit 
              ? "Update the details of the selected risk below." 
              : "Enter the details to add a new risk to the enterprise risk register."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Data Center Power Failure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IT">IT & Cyber</SelectItem>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Compliance">Compliance</SelectItem>
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
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Mitigated">Mitigated</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
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
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact (1-5)</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val ? parseInt(val, 10) : 0)}
                      value={field.value?.toString() ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Negligible</SelectItem>
                        <SelectItem value="2">2 - Minor</SelectItem>
                        <SelectItem value="3">3 - Moderate</SelectItem>
                        <SelectItem value="4">4 - Major</SelectItem>
                        <SelectItem value="5">5 - Catastrophic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="likelihood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Likelihood (1-5)</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val ? parseInt(val, 10) : 0)}
                      value={field.value?.toString() ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select likelihood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Rare</SelectItem>
                        <SelectItem value="2">2 - Unlikely</SelectItem>
                        <SelectItem value="3">3 - Possible</SelectItem>
                        <SelectItem value="4">4 - Likely</SelectItem>
                        <SelectItem value="5">5 - Almost Certain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Owner</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {riskToEdit ? "Save Changes" : "Create Risk"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
