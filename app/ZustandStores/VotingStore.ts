import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type Candidate = {
  id: number
  name: string
  party: string
  imageUrl: string
  voteCount: number
}

type VotingStore = {
  isVotingSessionCreated: boolean
  votingData: {
    id?: number | undefined
    title: string
    startTime: string
    endTime: string
    status?: 'pending' | 'ongoing' | 'ended'
    voteCount: number
    candidatesCount: number
    candidates: Candidate[]
  }
  createVotingSession: (votingData: VotingStore['votingData']) => void
  incrementCandidatesCount: () => void
  decrementCandidatesCount: () => void
  getCandidatesCount: () => number
  cancelVotingSessionCreation: () => void
  vote: (candidateId: number) => void
  setIsVotingSessionCreated: (isVotingSessionCreated: boolean) => void
}

export const useVotingStore = create<VotingStore>()(
  persist(
    (set, get) => ({
      isVotingSessionCreated: false,
      votingData: {
        id: undefined,
        title: '',
        startTime: '',
        endTime: '',
        status: undefined,
        voteCount: 0,
        candidatesCount: 2,
        candidates: [],
      },
      incrementCandidatesCount: () => {
        set((state) => ({
          votingData: {
            ...state.votingData,
            candidatesCount: state.votingData.candidatesCount + 1,
          },
        }))
      },
      decrementCandidatesCount: () => {
        if (get().votingData.candidatesCount === 2) return
        set((state) => ({
          votingData: {
            ...state.votingData,
            candidatesCount: state.votingData.candidatesCount - 1,
          },
        }))
      },
      getCandidatesCount: () => {
        // console.log(get().votingData.candidatesCount)
        return get().votingData.candidatesCount
      },
      createVotingSession: (votingData: VotingStore['votingData']) => {
        set({ votingData, isVotingSessionCreated: true })
      },
      cancelVotingSessionCreation: () => {
        set({
          votingData: {
            id: undefined,
            title: '',
            startTime: '',
            candidatesCount: 2,
            candidates: [],
            endTime: '',
            status: undefined,
            voteCount: 0,
          },
        })
        useVotingStore.persist.clearStorage()
      },
      setIsVotingSessionCreated: (isVotingSessionCreated: boolean) => {
        set({ isVotingSessionCreated })
      },
      vote: (candidateId: number) => {
        set((state) => ({
          votingData: {
            ...state.votingData,
            voteCount: state.votingData.voteCount + 1,
            candidates: state.votingData.candidates.map((candidate) =>
              candidate.id === candidateId
                ? { ...candidate, voteCount: candidate.voteCount + 1 }
                : candidate
            ),
          },
        }))
      },
    }),
    {
      name: 'voting-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const clearVotingStore = () => {
  useVotingStore.getState().cancelVotingSessionCreation()
  // useVotingStore.persist.clearStorage()
}
// {
//     id: 1,
//     title: 'Mock Voting Session',
//     description: 'This is a mock voting session',
//     startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
//     endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
//     status: 'ongoing',
//     totalVotes: 0,
//     candidates: [
//       {
//         id: 1,
//         name: 'Candidate 1',
//       },
//       {
//         id: 2,
//         name: 'Candidate 2',
//       },
//       {
//         id: 3,
//         name: 'Candidate 3',
//       },
//     ],
//   }
