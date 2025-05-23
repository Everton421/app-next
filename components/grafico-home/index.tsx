"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {Card,CardContent,CardDescription,CardHeader,CardTitle, } from "@/components/ui/card"
import {ChartConfig,ChartContainer,ChartTooltip,ChartTooltipContent, } from "@/components/ui/chart"

type chartData = {
    date: string
    desktop: number   
}
type props ={
   chartData:chartData[],
   totalVendas:number
}

const chartConfig = {
  views: {
    label: "Total Venda  ",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-0))",
    
  },
 
} satisfies ChartConfig

export function GraficoHome( {chartData ,totalVendas }:props) {
    const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop" )

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
    }),
    []
  )

  return (
    <Card className="w-full ">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row ">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle> Visão Geral de Vendas (Últimos 30 dias)</CardTitle>
          <CardDescription>
         
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop" ].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
        
                <span className="text-lg items-center font-bold leading-none sm:text-3xl flex">
                  { totalVendas && totalVendas.toFixed(2)}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-br", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-br", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`  } />
          </BarChart>

        </ChartContainer>
      </CardContent>
    </Card>
  )
}
