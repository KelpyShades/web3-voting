import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Timer } from '@/components/ui/timer'
import VoteDialog from './VoteDialog'

export default function VotingView() {
  const { votingData } = useVotingStore()
  if (!votingData) return null
  return (
    <Card className="w-full md:w-[80vw] lg:w-full">
      <CardHeader>
        <CardTitle>
          <div className="flex w-full items-center justify-between gap-2">
            <p className="text-xl font-bold">{votingData.title}</p>
            <p className="text-muted-foreground text-sm">
              {votingData.status === 'pending'
                ? 'Pending'
                : votingData.status === 'ongoing'
                  ? 'Ongoing'
                  : 'Ended'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex justify-evenly gap-2">
          <div className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground text-sm">Starts</p>
            <p className="text-sm font-bold">
              {new Date(votingData.startTime).toLocaleDateString()}
            </p>
            <p className="text-sm font-bold">
              {new Date(votingData.startTime).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-stretch px-4">
            <Separator orientation="vertical" />
          </div>

          <div className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground text-sm">Ends</p>
            <p className="text-sm font-bold">
              {new Date(votingData.endTime).toLocaleDateString()}
            </p>
            <p className="text-sm font-bold">
              {new Date(votingData.endTime).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* time now in epoch */}
        {/* Countdown to start time */}
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-sm">
            {votingData.status === 'pending'
              ? 'Countdown to start'
              : votingData.status === 'ongoing'
                ? 'Countdown to end'
                : ''}
          </p>
          {votingData.status === 'pending' && (
            <Timer expiryTimestamp={new Date(votingData.startTime)} />
          )}
          {votingData.status === 'ongoing' && (
            <Timer expiryTimestamp={new Date(votingData.endTime)} />
          )}
          {votingData.status === 'ended' && (
            <p className="text-4xl font-bold md:text-6xl lg:text-5xl">
              Voting ended
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex w-full justify-between">
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard
              .writeText(`${window.location.origin}/${votingData.id}`)
              .then(() => {
                alert('Link copied to clipboard')
              })
          }}
        >
          Copy Link
        </Button>
        {votingData.status === 'pending' && (
          <Button disabled className="w-[40%]">
            Vote
          </Button>
        )}
        {votingData.status === 'ongoing' && <VoteDialog />}
        {votingData.status === 'ended' && (
          <Button disabled className="w-[40%]">
            Vote
          </Button>
        )}
        {/* <Button onClick={testVote}>Test Vote</Button> */}
      </CardFooter>
    </Card>
  )
}
