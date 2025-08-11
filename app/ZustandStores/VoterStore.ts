import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type VoterStore = {
  voterId: string
  setVoterId: (voterId: string) => void
  clearVoterId: () => void
}

export const useVoterStore = create<VoterStore>()(
  persist((set, get) => ({
    voterId: '',
    setVoterId: (voterId) => set({ voterId }),
    clearVoterId: () => {
      set({ voterId: '' })
    },
  }), {
    name: 'voter-store',
    storage: createJSONStorage(() => localStorage),
  })
)
