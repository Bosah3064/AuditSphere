"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { status: "planning", count: 4, fill: "#3AA335" }, /* Safaricom Green */
  { status: "fieldwork", count: 7, fill: "#DE1E23" }, /* Safaricom Red */
  { status: "review", count: 3, fill: "#FFD700" }, /* Yellow */
  { status: "reporting", count: 2, fill: "#0096D6" }, /* Blue */
]

const chartConfig = {
  count: {
    label: "Audits",
  },
  planning: {
    label: "Planning",
    color: "#3AA335",
  },
  fieldwork: {
    label: "Fieldwork",
    color: "#DE1E23",
  },
  review: {
    label: "In Review",
    color: "#FFD700",
  },
  reporting: {
    label: "Reporting",
    color: "#0096D6",
  },
} satisfies ChartConfig

export function AuditProgress() {
  const totalAudits = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <Card className="glass-card flex flex-col col-span-1 lg:col-span-2">
      <CardHeader className="items-center pb-0">
        <CardTitle>Audit Lifecycle</CardTitle>
        <CardDescription>Current active audits by phase</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalAudits}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Active
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
