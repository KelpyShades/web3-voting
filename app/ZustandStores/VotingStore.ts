import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface VotingStore {
  isVotingSessionCreated: boolean
  votingData: {
    id: number
    title: string
    description: string
    startTime: string
    endTime: string
    status?: 'pending' | 'ongoing' | 'ended'
    totalVotes: number
    candidatesCount: number
    candidates: {
      id: number
      name: string
    }[]
  }
  createVotingSession: (votingData: VotingStore['votingData']) => void
  incrementCandidatesCount: () => void
  decrementCandidatesCount: () => void
  getCandidatesCount: () => number
  cancelVotingSessionCreation: () => void
  setIsVotingSessionCreated: (isVotingSessionCreated: boolean) => void
}

export const useVotingStore = create<VotingStore>()(
  persist(
    (set, get) => ({
      isVotingSessionCreated: false,
      votingData: {
        id: 0,
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        status: undefined,
        totalVotes: 0,
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
        console.log(get().votingData.candidatesCount)
        return get().votingData.candidatesCount
      },
      createVotingSession: (votingData: VotingStore['votingData']) => {
        set({ votingData, isVotingSessionCreated: true })
      },
      cancelVotingSessionCreation: () => {
        set({
          votingData: {
            id: 0,
            title: '',
            description: '',
            startTime: '',
            candidatesCount: 2,
            candidates: [],
            endTime: '',
            status: undefined,
            totalVotes: 0,
          },
        })
      },
      setIsVotingSessionCreated: (isVotingSessionCreated: boolean) => {
        set({ isVotingSessionCreated })
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
  useVotingStore.persist.clearStorage()
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
