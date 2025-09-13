'use client'

import * as React from 'react'
import { TrendingUp } from 'lucide-react'
import { Label, Pie, PieChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'

export const description = 'A donut chart with text'

type VotingChartConfig = {
  [key: string]: {
    label: string
    color: string
  }
}

export function ChartPieDonutText() {
  const { votingData } = useVotingStore()

  // Build a safe key for CSS variables and config
  const votingChartConfig: ChartConfig = {
    votes: { label: 'Votes' },
    ...Object.fromEntries(
      votingData.candidates.map((c) => [
        `c${c.id}`,
        { label: c.name, color: `var(--chart-${c.id})` },
      ])
    ),
  }

  const votingChartData = votingData.candidates.map((candidate) => ({
    candidate: `${candidate.party} ${candidate.name}`,
    votes: candidate.voteCount,
    fill: `var(--color-c${candidate.id})`,
  }))

  const totalVotes = React.useMemo(() => {
    return votingData.candidates.reduce((acc, curr) => acc + curr.voteCount, 0)
  }, [votingData])

  return (
    // <div className="flex flex-1 h-full flex-col items-center justify-center">
    <ChartContainer config={votingChartConfig} className="aspect-square h-full">
      {(() => {
        // Determine if we should render a neutral donut when there are
        // zero votes to avoid an empty chart.
        const isPending = votingData.status === 'pending'
        const isOngoing = votingData.status === 'ongoing'
        const isEnded = votingData.status === 'ended'
        const showNeutralDonut =
          (isPending || isOngoing || isEnded) && totalVotes === 0
        const displayedData = showNeutralDonut
          ? [
              {
                candidate: 'No votes yet',
                votes: 1,
              },
            ]
          : votingChartData
        return (
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={displayedData}
              dataKey="votes"
              nameKey="candidate"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
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
                          {totalVotes.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Votes
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        )
      })()}
    </ChartContainer>
    // </div>
    // <Card className="flex flex-col">
    //   <CardHeader className="items-center pb-0">
    //     <CardTitle>Pie Chart - Donut with Text</CardTitle>
    //     <CardDescription>January - June 2024</CardDescription>
    //   </CardHeader>
    //   <CardContent className="flex-1 pb-0">

    //   </CardContent>
    //   <CardFooter className="flex-col gap-2 text-sm">
    //     <div className="flex items-center gap-2 leading-none font-medium">
    //       Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
    //     </div>
    //     <div className="text-muted-foreground leading-none">
    //       Showing total visitors for the last 6 months
    //     </div>
    //   </CardFooter>
    // </Card>
  )
}
