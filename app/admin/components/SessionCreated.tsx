import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import DeleteSessionDialog from './DeleteSessionDialog'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import StartVoting from './StartVoting'
import Image from 'next/image'
import CandidatePreview from './CandidatePreview'
// import { cancelVoting } from '@/app/ethers/transactions'

export default function SessionCreated({
  resetForm,
}: {
  resetForm: () => void
}) {
  const { votingData, setIsVotingSessionCreated } = useVotingStore()

  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-6 pb-10">
      <Card className="w-full shadow-md">
        <CardHeader className="text-center">
          {/* <CardTitle className="text-2xl">{votingData.title}</CardTitle> */}
          <p className="text-muted-foreground">
            Voting session successfully created
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Session Details */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Title
                </p>
                <p className="text-lg font-semibold">{votingData.title}</p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Status
                </p>
                <p className="text-lg font-semibold capitalize">
                  {votingData.status}
                </p>
              </div>
            </div>

            {/* Time Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Start Time
                </p>
                <p className="text-base">
                  {new Date(votingData.startTime).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  End Time
                </p>
                <p className="text-base">
                  {new Date(votingData.endTime).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Candidates Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm font-medium">
                  Candidates
                </p>
                <span className="rounded-full px-2 py-1 text-xs">
                  {votingData.candidates.length} candidates
                </span>
              </div>

              <CandidatePreview />
            </div>

            {/* Vote Count */}
            {/* <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-muted-foreground text-sm font-medium">
                Total Votes Cast
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {votingData.voteCount}
              </p>
            </div> */}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* Copy Link */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              navigator.clipboard
                .writeText(`${window.location.origin}/${votingData.id}`)
                .then(() => {
                  alert('Link copied to clipboard')
                })
            }}
          >
            Copy Voting Link
          </Button>

          {/* Action Buttons */}
          <div className="flex w-full flex-col justify-end gap-3 sm:flex-row">
            {votingData.status === 'pending' && (
              <>
                <DeleteSessionDialog
                  onDelete={() => {
                    resetForm()
                  }}
                />
                <StartVoting />
              </>
            )}
            {votingData.status === 'ended' && (
              <div className="flex flex-col gap-3 w-full">
                <Button
                  className="w-full"
                  onClick={() => {
                    redirect(`${window.location.origin}/${votingData.id}`)
                  }}
                >
                  View Results
                </Button>
                <DeleteSessionDialog
                  onDelete={() => {
                    resetForm()
                  }}
                />
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
