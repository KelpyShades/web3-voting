import ClientOnlyVotingPage from './components/ClientOnlyVotingPage'

// chek url params
// if marams ends with a [sessionId] we fetch the session data and redirect to the sessionId page
// if there in no data associated with the sessionId we show a message that the session is not found or invalid
// if there is no [sessionId] we redirect to the home page

export default function VotingPage() {
  return <ClientOnlyVotingPage />
}
