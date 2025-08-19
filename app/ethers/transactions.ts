/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { BrowserProvider, Contract, JsonRpcProvider, Wallet } from 'ethers'
import {
  VOTING_ABI,
  VOTING_CONTRACT_ADDRESS,
  ADMIN_PRIVATE_KEY,
} from './events'

export async function createVotingSession(
  votingId: number,
  title: string,
  startDate: number,
  endDate: number,
  candidates: Array<{ name: string; party: string }>
) {
  const provider = new JsonRpcProvider('http://127.0.0.1:9545')
  const adminWallet = new Wallet(ADMIN_PRIVATE_KEY, provider)
  const contract = new Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_ABI,
    adminWallet
  )

  // Debug checks
  const onChainAdmin = await contract.admin()
  const votingCreated = await contract.votingCreated?.() // if this getter exists
  const now = Math.floor(Date.now() / 1000)

  // Transform candidates to match contract struct
  const candidatesWithIds = candidates.map((candidate, index) => ({
    id: index + 1, // Start IDs from 1
    name: candidate.name,
    party: candidate.party,
    voteCount: 0, // Initial vote count is 0
  }))

  const tx = await contract.createVoting(
    votingId,
    title,
    startDate,
    endDate,
    candidatesWithIds // Use the transformed array
  )
  return await tx.wait()
}

export async function deleteVotingSession() {
  const provider = new JsonRpcProvider('http://127.0.0.1:9545')
  const adminWallet = new Wallet(ADMIN_PRIVATE_KEY, provider)
  const contract = new Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_ABI,
    adminWallet
  )

  // sanity check
  const onChainAdmin = await contract.admin()
  if (onChainAdmin.toLowerCase() !== adminWallet.address.toLowerCase()) {
    throw new Error(`Wrong admin key. contract admin = ${onChainAdmin}`)
  }

  const tx = await contract.deleteVoting()
  return await tx.wait()
}

export async function vote(
  candidateId: number,
  voterAddress: string,
  voterKey: string
) {
  // we will ask the user to authenticate with metamask later
  const provider = new JsonRpcProvider('http://127.0.0.1:9545')
  const voterWallet = new Wallet(voterKey, provider)
  const contract = new Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_ABI,
    voterWallet
  )

  const tx = await contract.vote(candidateId, voterAddress)
  return await tx.wait()
}

/**
 * Start voting immediately and end at a specific time
 */
export async function startVotingImmediately(endDate: number) {
  const provider = new JsonRpcProvider('http://127.0.0.1:9545')
  const adminWallet = new Wallet(ADMIN_PRIVATE_KEY, provider)
  const contract = new Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_ABI,
    adminWallet
  )

  // Verify admin
  const onChainAdmin = await contract.admin()
  if (onChainAdmin.toLowerCase() !== adminWallet.address.toLowerCase()) {
    throw new Error(`Wrong admin key. contract admin = ${onChainAdmin}`)
  }

  const tx = await contract.startVotingImmediately(endDate)
  return await tx.wait()
}


/**
 * Checks if a voter has already voted
 * @param voterAddress - The address of the voter to check
 * @param voterKey - The private key of the voter to check
 * @returns Promise that resolves to true if the voter has voted, false otherwise
 */
export async function checkVoterHasVoted(voterAddress: string, voterKey: string): Promise<boolean> {
  const provider = new JsonRpcProvider('http://127.0.0.1:9545')
  const voterWallet = new Wallet(voterKey, provider)
  const contract = new Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_ABI,
    voterWallet
  )
  const res: boolean = await contract.checkVote(voterAddress)
  return Boolean(res)
}
