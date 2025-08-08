// app/AuthWatcher.tsx
'use client'
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { clearVotingStore } from '@/app/ZustandStores/VotingStore'

export default function AuthWatcher() {
  const { isSignedIn } = useAuth()
  useEffect(() => {
    console.log('isSignedIn', isSignedIn)
    if (!isSignedIn) clearVotingStore()
  }, [isSignedIn])
  return null
}
