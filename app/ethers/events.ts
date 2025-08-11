// Client-side ethers.js wiring for Voting contract: initial fetch + live updates
// - Fills Zustand `useVotingStore` with session data
// - Listens to contract events over WebSocket and updates store
// - Exposes helpers to check a voter's status

'use client'

// Import necessary libraries and components
import { Contract, WebSocketProvider, type Log } from 'ethers'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import { useVoterStore } from '@/app/ZustandStores/VoterStore'
import VotingAbi from '@/blockchain/build/contracts/Voting.json'

// ===== Configuration (set these for your environment) =====
// WebSocket RPC endpoint (Ganache/Hardhat/Anvil). Example for Ganache:
export const PROVIDER_WS_URL = 'ws://127.0.0.1:9545' // change if needed

// Deployed Voting contract address (set after deploy)
export const VOTING_CONTRACT_ADDRESS =
  '0xC51b7a92b23b5cf986829969277EB8E069E8Af2c'

// Optional: Admin address (not strictly needed for event sync, but kept for clarity/config)
export const ADMIN_ADDRESS = '0xe6de4c5c30077e36ef9b853ebedfffded0b8b65e'

// Admin private key from Ganache/Truffle (first account is usually admin)
export const ADMIN_PRIVATE_KEY =
  '3cca3b660d99e90b110a2fc0dc792adf9c70d99048a8e503f9fe8a23fb13af4f'

// ===== Voting contract ABI (From Migration Artifacts) =====
// ABI (Application Binary Interface) defines how to interact with the smart contract
export const VOTING_ABI = VotingAbi.abi


// ===== Local types for UI sync =====
// Define the structure for a candidate in the UI
export type UICandidate = {
  id: number
  name: string
  party: string
  voteCount: number
}

// Define the structure for a voting session in the UI
export type UIVotingSession = {
  id: number
  title: string
  startTime: number // unix seconds
  endTime: number // unix seconds
  status: 'pending' | 'ongoing' | 'ended'
  voteCount: number
  candidatesCount: number
  candidates: UICandidate[]
}

// ===== Module state =====
// Initialize provider, contract, and started flag
let provider: WebSocketProvider | null = null
let contract: Contract | null = null
let started = false

// ===== Utilities =====
/**
 * Determines the status of a voting session based on start and end times
 * @param start - Start time in unix seconds
 * @param end - End time in unix seconds
 * @returns Status of the voting session ('pending', 'ongoing', or 'ended')
 */
function computeStatus(
  start: number,
  end: number
): 'pending' | 'ongoing' | 'ended' {
  const now = Math.floor(Date.now() / 1000)
  if (start > now) return 'pending'
  if (end <= now) return 'ended'
  return 'ongoing'
}

/**
 * Calculates the total number of votes across all candidates
 * @param candidates - Array of candidates with vote counts
 * @returns Total number of votes
 */
function recomputeTotalVotes(candidates: UICandidate[]): number {
  return candidates.reduce((sum, c) => sum + (c.voteCount ?? 0), 0)
}

/**
 * Updates the voting store with new session data
 * @param data - Partial voting session data to update
 */
function setVotingStoreSession(
  data: Partial<UIVotingSession> & { present?: boolean }
) {
  // Get current state and functions from the store
  const { createVotingSession, setIsVotingSessionCreated } =
    useVotingStore.getState()
  const current = useVotingStore.getState().votingData
  
  // Merge new data with existing data
  const merged: UIVotingSession = {
    id: data.id ?? (current.id as number) ?? 0,
    title: data.title ?? current.title ?? '',
    startTime:
      data.startTime ??
      (current.startTime
        ? Math.floor(new Date(current.startTime).getTime() / 1000)
        : 0),
    endTime:
      data.endTime ??
      (current.endTime
        ? Math.floor(new Date(current.endTime).getTime() / 1000)
        : 0),
    status:
      data.status ??
      current.status ??
      computeStatus(
        data.startTime
          ? Number(data.startTime)
          : current.startTime
            ? Number(current.startTime)
            : 0,
        data.endTime
          ? Number(data.endTime)
          : current.endTime
            ? Number(current.endTime)
            : 0
      ),
    voteCount: data.voteCount ?? current.voteCount ?? 0,
    candidatesCount: data.candidatesCount ?? current.candidatesCount ?? 0,
    candidates: data.candidates ?? (current.candidates as any) ?? [],
  }
  
  // Persist in the same shape as store expects
  createVotingSession({
    id: merged.id,
    title: merged.title,
    startTime: new Date(merged.startTime * 1000).toISOString(),
    endTime: new Date(merged.endTime * 1000).toISOString(),
    status: merged.status,
    voteCount: merged.voteCount,
    candidatesCount: merged.candidatesCount,
    candidates: merged.candidates,
  } as any)
  
  // Update the flag indicating a session is created
  setIsVotingSessionCreated(true)
}

/**
 * Clears the current voting session from the store
 */
function clearVotingStoreSession() {
  const { cancelVotingSessionCreation, setIsVotingSessionCreated } =
    useVotingStore.getState()
  cancelVotingSessionCreation()
  setIsVotingSessionCreated(false)
}

// ===== Initial fetch from past events =====
/**
 * Loads the most recent voting session from blockchain events history
 */
async function hydrateFromPastEvents() {
  if (!contract) return
  
  // Query for all VotingCreated events
  const createdLogs = await contract.queryFilter(
    contract.filters.VotingCreated()
  )
  
  // If no voting sessions found, clear the store
  if (!createdLogs.length) {
    clearVotingStoreSession()
    return
  }

  // Get the most recent voting session
  const last = createdLogs[createdLogs.length - 1] as unknown as Log & {
    args: readonly [
      bigint,
      bigint,
      bigint,
      string,
      Array<{ id: bigint; name: string; party: string; voteCount: bigint }>,
    ]
  }

  // Extract voting session details
  const votingId = Number(last.args[0])
  const start = Number(last.args[1])
  const end = Number(last.args[2])
  const title = last.args[3]
  const candidatesRaw = last.args[4]

  // Convert candidate data to UI format
  const candidates: UICandidate[] = candidatesRaw.map((c) => ({
    id: Number(c.id),
    name: c.name,
    party: c.party,
    voteCount: Number(c.voteCount),
  }))

  // Apply votes since creation by querying Voted events
  const fromBlock = last.blockNumber ?? 0
  const votedLogs = await contract.queryFilter(
    contract.filters.Voted(),
    fromBlock
  )
  
  // Update vote counts for each candidate
  for (const log of votedLogs) {
    const l = log as unknown as Log & { args: readonly [bigint, bigint] }
    const candidateId = Number(l.args[0])
    const newCount = Number(l.args[1])
    const idx = candidates.findIndex((c) => c.id === candidateId)
    if (idx >= 0) candidates[idx] = { ...candidates[idx], voteCount: newCount }
  }

  // Calculate total votes and current status
  const voteCount = recomputeTotalVotes(candidates)
  const status = computeStatus(start, end)

  // Update the store with the complete voting session
  setVotingStoreSession({
    id: votingId,
    title,
    startTime: start,
    endTime: end,
    status,
    candidates,
    candidatesCount: candidates.length,
    voteCount,
  })
}

// ===== Live listeners =====
/**
 * Attaches event listeners to the contract for real-time updates
 */
function attachEventListeners() {
  if (!contract) return

  // VotingCreated: replace session when a new voting is created
  contract.on(
    'VotingCreated',
    (
      votingId: bigint,
      votingStart: bigint,
      votingEnd: bigint,
      votingTitle: string,
      candidatesRaw: Array<{
        id: bigint
        name: string
        party: string
        voteCount: bigint
      }>
    ) => {
      console.log(votingStart)
      console.log(votingEnd)

      // Convert candidate data to UI format
      const candidates: UICandidate[] = candidatesRaw.map((c) => ({
        id: Number(c.id),
        name: c.name,
        party: c.party,
        voteCount: Number(c.voteCount),
      }))
      
      // Update the store with the new voting session
      setVotingStoreSession({
        id: Number(votingId),
        title: votingTitle,
        startTime: Number(votingStart),
        endTime: Number(votingEnd),
        status: computeStatus(Number(votingStart), Number(votingEnd)),
        candidates,
        candidatesCount: candidates.length,
        voteCount: recomputeTotalVotes(candidates),
      })
    }
  )

  // Voted: update a candidate's tally when a new vote is cast
  contract.on('Voted', (candidateId: bigint, voteCount: bigint) => {
    const { votingData } = useVotingStore.getState()
    if (!votingData?.candidates?.length) return
    
    // Update the vote count for the specific candidate
    const updated = votingData.candidates.map((c) =>
      c.id === Number(candidateId) ? { ...c, voteCount: Number(voteCount) } : c
    )
    
    // Recalculate total votes
    const total = recomputeTotalVotes(updated)
    
    // Update the store
    setVotingStoreSession({
      candidates: updated,
      candidatesCount: updated.length,
      voteCount: total,
    })

    // Optional: refresh current voter's status (requires their ID)
    const voterId = useVoterStore.getState().voterId
    if (voterId) void checkVoterHasVoted(voterId).catch(() => {})
  })

  // VotingDeleted: clear session when a voting is deleted
  contract.on('VotingDeleted', () => {
    clearVotingStoreSession()
  })
}

/**
 * Removes all event listeners from the contract
 */
function detachEventListeners() {
  if (!contract) return
  contract.removeAllListeners('VotingCreated')
  contract.removeAllListeners('Voted')
  contract.removeAllListeners('VotingDeleted')
}

// ===== Public API =====
/**
 * Initializes the connection to the blockchain and starts syncing events
 * @param options - Optional configuration for WebSocket URL and contract address
 * @returns Promise that resolves when initialization is complete
 */
export async function startVotingEventsSync(options?: {
  wsUrl?: string
  contractAddress?: string
}): Promise<void> {
  // Prevent multiple initializations
  if (started) return
  
  // Get configuration values
  const ws = options?.wsUrl ?? PROVIDER_WS_URL
  const address = options?.contractAddress ?? VOTING_CONTRACT_ADDRESS
  if (!ws || !address) return

  // Initialize provider and contract
  provider = new WebSocketProvider(ws)
  contract = new Contract(address, VOTING_ABI, provider)

  // Load initial data and attach event listeners
  await hydrateFromPastEvents()
  attachEventListeners()
  started = true
}

/**
 * Stops event syncing and cleans up resources
 */
export function stopVotingEventsSync(): void {
  if (!started) return
  try {
    detachEventListeners()
    provider?.destroy?.()
  } catch {}
  provider = null
  contract = null
  started = false
}

/**
 * Returns the current contract instance
 * @returns The voting contract or null if not initialized
 */
export function getVotingContract(): Contract | null {
  return contract
}

/**
 * Checks if a voter has already voted
 * @param voterId - The ID of the voter to check
 * @returns Promise that resolves to true if the voter has voted, false otherwise
 */
export async function checkVoterHasVoted(voterId: string): Promise<boolean> {
  if (!contract) throw new Error('Contract not initialized')
  // Directly queries the contract's checkVote(voterId)
  const res: boolean = await contract.checkVote(voterId)
  return Boolean(res)
}
