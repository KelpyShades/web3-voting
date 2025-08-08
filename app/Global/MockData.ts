// only one

export const votingSession = {
  id: 1,
  title: 'Mock Voting Session',
  description: 'This is a mock voting session',
  startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
  endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
  status: 'ongoing',
  totalVotes: 0,
  candidates: [
    {
      id: 1,
      name: 'Candidate 1',
    },
    {
      id: 2,
      name: 'Candidate 2',
    },
    {
      id: 3,
      name: 'Candidate 3',
    },
  ],
}
