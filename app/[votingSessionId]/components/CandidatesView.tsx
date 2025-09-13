'use client'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CountUp from '@/components/ui/count-up'
import Image from 'next/image'

export default function CandidatesView() {
  const { votingData } = useVotingStore()
  if (!votingData) return null
  return (
    <div className="scrollbar-hide flex max-h-[80vh] w-full flex-col gap-4 lg:overflow-y-auto">
      {votingData.candidates.map((candidate) => {
        let totalVotes = 0
        votingData.candidates.forEach((c) => {
          totalVotes += c.voteCount
        })
        let percentage = (candidate.voteCount / totalVotes) * 100
        if (isNaN(percentage)) {
          percentage = 0
        }
        return (
          <Card
            key={candidate.id}
            style={{
              backgroundColor: `var(--chart-${candidate.id})`,
              width: `100%`,
            }}
          >
            <CardHeader>
              <CardTitle>
                <div className="flex w-full items-center justify-between gap-2 text-black">
                  <p className="overflow-hidden font-bold text-ellipsis whitespace-nowrap">
                    {candidate.name}
                  </p>
                  <p className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
                    {candidate.party}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Card>
                <CardContent className="flex gap-10 text-lg">
                  <Image
                    src={candidate.imageUrl}
                    alt={candidate.name}
                    width={200}
                    height={200}
                    className="size-25 rounded-lg object-cover"
                    priority
                  />
                  <div className="flex flex-col justify-center gap-2">
                    <p className="font-bold">
                      <CountUp
                        from={0}
                        to={candidate.voteCount}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />{' '}
                      votes
                    </p>
                    <p className="font-bold">{percentage.toFixed(2)}%</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
