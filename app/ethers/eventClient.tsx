'use client'

import { useEffect } from 'react'
import { startVotingEventsSync } from './events'

export default function EventClient() {
  useEffect(() => {
    async function startEvents() {
      try {
        await startVotingEventsSync()
      } catch (error) {
        console.error(error)
      }
    }
    startEvents()
  }, [])
  return null
}
