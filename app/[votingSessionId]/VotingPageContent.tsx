'use client'
import { useParams } from 'next/navigation'
import { useVotingStore } from '../ZustandStores/VotingStore'
import { ChartPieDonutText } from '@/components/ui/pie-chart'
import CandidatesView from './components/CandidatesView'
import VotingView from './components/VotingView'
import { Timer } from '@/components/ui/timer'

// chek url params
// if marams ends with a [sessionId] we fetch the session data and redirect to the sessionId page
// if there in no data associated with the sessionId we show a message that the session is not found or invalid
// if there is no [sessionId] we redirect to the home page

export default function VotingPageContent() {
  const sessionId = useParams().votingSessionId
  const votingSession = useVotingStore((state) => state.votingData)

  if (!sessionId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1>No session ID</h1>
      </div>
    )
  } else if (!votingSession || votingSession.id !== Number(sessionId)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1>Session not found</h1>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-8 py-8 lg:flex-row lg:px-8">
      <div className="flex w-full flex-col items-center justify-center p-4">
        {/* Voting details */}
        <VotingView />
      </div>
      {/* pie chart of ongoing voting session */}
      <div className="flex h-[40vh] w-min flex-col items-center justify-center md:h-[50vh] lg:h-[60vh]">
        <ChartPieDonutText />
      </div>
      <div className="flex w-full flex-col items-center justify-center px-4 md:w-[80vw] lg:w-full">
        {/* cantidates details */}
        <CandidatesView />
      </div>
    </div>
  )
}
