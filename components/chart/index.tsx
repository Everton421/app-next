'use client'
import { Card, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent  } from "../ui/chart";
import { Bar, CartesianGrid, XAxis , BarChart } from "recharts";


export function ChartOverView(){

    const chartData = [
        { month: "January", desktop: 186, mobile: 80 },
        { month: "February", desktop: 305, mobile: 200 },
        { month: "March", desktop: 237, mobile: 120 },
        { month: "April", desktop: 73, mobile: 190 },
        { month: "May", desktop: 209, mobile: 130 },
        { month: "June", desktop: 214, mobile: 140 },
      ]


      const chartConfig = {
        desktop: {
          label: "Desktop",
          color: "#2563eb",
        },
        mobile: {
          label: "Mobile",
          color: "#60a5fa",
        },
       } satisfies ChartConfig

    return (
        <Card className="w-full md:w1/2 md:max-w-[700px]">
           <CardHeader>
                <div className="flex items-center justify-center">
                    <CardTitle className="text-lg sm:text-xl text-gray-800">
                        Overview Vendas
                    </CardTitle>
                </div>
           </CardHeader>

            <ChartContainer  config={ chartConfig } className="min-h-[200px]" >
             <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={  ( value )=> value.slice( 0,3 ) }
                />      
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <ChartLegend content={<ChartLegendContent />} />
                   <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                   <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />   
             </BarChart>
            </ChartContainer>

        </Card>
    )
}