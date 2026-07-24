"use client"

import * as React from "react"
import Link from "next/link"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"

interface Audit {
  id: string
  title: string
  type: string
  status: string
  progress: number
  risk: string
  startDate: string
  endDate: string
  lead: string
}

const getAuditColumns = (onDelete?: (audit: Audit) => void): ColumnDef<Audit>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Audit Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Link href={`/audits/${row.original.id}`} className="font-medium hover:underline hover:text-primary">
        {row.getValue("title")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let colorClass = "bg-muted text-muted-foreground"
      
      switch (status.toLowerCase()) {
        case "planning": colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20"; break;
        case "fieldwork": colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20"; break;
        case "review": colorClass = "bg-purple-500/10 text-purple-500 border-purple-500/20"; break;
        case "reporting": colorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"; break;
      }
      
      return (
        <Badge variant="outline" className={colorClass}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = parseFloat(row.getValue("progress"))
      return (
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-[60px] h-2" />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "risk",
    header: "Risk Level",
    cell: ({ row }) => {
      const risk = row.getValue("risk") as string
      let riskColor = "text-muted-foreground"
      switch (risk.toLowerCase()) {
        case "critical": riskColor = "text-risk-critical font-medium"; break;
        case "high": riskColor = "text-risk-high font-medium"; break;
        case "medium": riskColor = "text-risk-medium"; break;
        case "low": riskColor = "text-risk-low"; break;
      }
      return <span className={riskColor}>{risk}</span>
    },
  },
  {
    accessorKey: "lead",
    header: "Lead Auditor",
  },
  {
    accessorKey: "endDate",
    header: "Target Completion",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const audit = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(audit.id)}
              >
                Copy audit ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/audits/${audit.id}`} className="w-full">View details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/audits/${audit.id}/findings`} className="w-full">View findings</Link>
              </DropdownMenuItem>
              {onDelete ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(audit)}
                  >
                    Archive
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface DataTableProps<TData, TValue> {
  data: TData[]
  onDelete?: (audit: Audit) => void
}

export function AuditTable({ data, onDelete }: DataTableProps<Audit, any>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const columns = React.useMemo(() => getAuditColumns(onDelete), [onDelete])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter audits..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border glass-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
