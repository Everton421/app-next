"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {Card,CardContent,CardDescription,CardHeader,CardTitle, } from "@/components/ui/card"
import {ChartConfig,ChartContainer,ChartTooltip,ChartTooltipContent, } from "@/components/ui/chart"
import { DollarSign, Ellipsis  } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { Button } from "@/components/ui/button";

type chartData = {
    date: string
    desktop: number   
}
type props ={
   chartData:chartData[],
   totalVendas:number,
   setDataInicial:React.Dispatch<React.SetStateAction<string>>,
   setDataFinal:React.Dispatch<React.SetStateAction<string>>,
dataInicial:string,
dataFinal:string
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

export function GraficoHome( {chartData ,totalVendas, setDataInicial, setDataFinal, dataInicial, dataFinal }:props) {
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
          <div className="">
          <CardTitle> Visão Geral de Vendas </CardTitle>

           <Popover>
          <PopoverTrigger>  
                <Button   className="bg-white shadow-md mt-1">
                        <Ellipsis  className=" w-4 md:w-10"   color="#000" />
                </Button> 

        </PopoverTrigger>

          <PopoverContent className="bg-white w-full ">
                  <div className="w-full  flex">
                    
                    < label className="m-5 font-bold "> inicio</label>

                        <input 
                          type="date"
                          className="font-bold text-gray-500"
                          onChange={( v )=> setDataInicial(v.target.value+' 00:00:00')}  
                          defaultValue={dataInicial} 
                        />
                    
                    < label className="m-5 font-bold">  final</label>
                        <input 
                          type="date"
                          className="font-bold text-gray-500" 
                         onChange={(v)=> setDataFinal(v.target.value+' 23:59:00')} 
                          defaultValue={dataFinal} 
                          />
                  </div>                     
              
                <div className=" m-2">
                {/*<TipoPedidoSeletor  setTipo={setFiltroTipo} tipo={filtrTipo}  /> */}
                </div>
              </PopoverContent>

          </Popover>
        </div>
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
                <DollarSign className="w-4 md:w-6 "/>   { totalVendas &&   new Intl.NumberFormat('de-DE').format(totalVendas)   }
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
                return date.toLocaleString("pt-br", {
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
                    return new Date(value).toLocaleString("pt-br", {
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
