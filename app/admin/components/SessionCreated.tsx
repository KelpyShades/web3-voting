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

export default function SessionCreated({
  resetForm,
}: {
  resetForm: () => void
}) {
  const { votingData, setIsVotingSessionCreated } = useVotingStore()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <Card className="w-full gap-4">
        <CardHeader>
          <CardTitle>Voting Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Title
                </p>
                <p className="text-base">{votingData.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Status
                </p>
                <p className="text-base capitalize">{votingData.status}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Description
              </p>
              <p className="text-base">{votingData.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Start Time
                </p>
                <p className="text-base">
                  {new Date(votingData.startTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  End Time
                </p>
                <p className="text-base">
                  {new Date(votingData.endTime).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Candidates
              </p>
              <ul className="mt-1 space-y-1">
                {votingData.candidates.map((candidate) => (
                  <li key={candidate.id} className="text-base">
                    {candidate.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Votes
              </p>
              <p className="text-base">{votingData.totalVotes}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard
                .writeText(`${window.location.origin}/vote/${votingData.id}`)
                .then(() => {
                  alert('Link copied to clipboard')
                })
            }}
          >
            Copy Link
          </Button>
          <div className="flex w-full justify-end gap-4">
            <DeleteSessionDialog
              onDelete={() => {
                // setMakingVotingSession(false)
                resetForm()
                setIsVotingSessionCreated(false)
              }}
            />
            {/* <Button
                onClick={() => {
                  // setMakingVotingSession(false)
                  resetForm()
                  setIsVotingSessionCreated(false)
                }}
                variant="destructive"
              >
                Delete
              </Button> */}
            {votingData.status === 'pending' && (
              <Button
                onClick={() => {
                  // setMakingVotingSession(true)
                  // setIsVotingSessionCreated(true)
                  setIsVotingSessionCreated(false)
                }}
              >
                Edit
              </Button>
            )}
            {votingData.status === 'ended' && (
              <Button
                onClick={() => {
                  // setMakingVotingSession(true)
                  // setIsVotingSessionCreated(true)
                  // setIsVotingSessionCreated(false)
                }}
              >
                View Results
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
