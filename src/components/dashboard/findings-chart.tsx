"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "Jan", critical: 2, high: 5, medium: 12, low: 8 },
  { month: "Feb", critical: 1, high: 4, medium: 15, low: 10 },
  { month: "Mar", critical: 3, high: 2, medium: 8, low: 5 },
  { month: "Apr", critical: 0, high: 6, medium: 10, low: 12 },
  { month: "May", critical: 1, high: 3, medium: 14, low: 9 },
  { month: "Jun", critical: 0, high: 2, medium: 7, low: 4 },
]

const chartConfig = {
  critical: {
    label: "Critical",
    color: "hsl(var(--risk-critical))",
  },
  high: {
    label: "High",
    color: "hsl(var(--risk-high))",
  },
  medium: {
    label: "Medium",
    color: "hsl(var(--risk-medium))",
  },
  low: {
    label: "Low",
    color: "hsl(var(--risk-low))",
  },
} satisfies ChartConfig

export function FindingsChart() {
  return (
    <Card className="glass-card col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Findings by Severity</CardTitle>
        <CardDescription>Historical trend of audit findings over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} opacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={30}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="low" stackId="a" fill="var(--color-low)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="medium" stackId="a" fill="var(--color-medium)" />
            <Bar dataKey="high" stackId="a" fill="var(--color-high)" />
            <Bar dataKey="critical" stackId="a" fill="var(--color-critical)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
