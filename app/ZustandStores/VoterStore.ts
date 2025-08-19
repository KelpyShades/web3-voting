import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type VoterStore = {
  voterId: string
  voterAddress: string
  voterKey: string
  setVoter: (voterId: string, voterAddress: string, voterKey: string) => void
  getVoterId: () => string
  getVoterAddress: () => string
  getVoterKey: () => string
  clearVoterId: () => void
}

export const useVoterStore = create<VoterStore>()(
  persist(
    (set, get) => ({
      voterId: '',
      voterAddress: '',
      voterKey: '',
      setVoter: (voterId, voterAddress, voterKey) =>
        set({
          voterId: voterId,
          voterAddress: voterAddress,
          voterKey: voterKey,
        }),
      getVoterId: () => get().voterId,
      getVoterAddress: () => get().voterAddress,
      getVoterKey: () => get().voterKey,
      clearVoterId: () => {
        set({ voterId: '', voterAddress: '', voterKey: '' })
      },
    }),
    {
      name: 'voter-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
