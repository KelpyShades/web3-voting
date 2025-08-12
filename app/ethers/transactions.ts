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

export async function vote(candidateId: number, voterId: string) {
  // we will ask the user to authenticate with metamask later
  const provider = new JsonRpcProvider('http://127.0.0.1:9545')
  const adminWallet = new Wallet(ADMIN_PRIVATE_KEY, provider)
  const contract = new Contract(
    VOTING_CONTRACT_ADDRESS,
    VOTING_ABI,
    adminWallet
  )



  const tx = await contract.vote(candidateId, voterId)
  return await tx.wait()
}

export async function testVote() {

  // await (window as any).ethereum.request({
  //   method: 'wallet_addEthereumChain',
  //   params: [{
  //     chainId: '0x539', // Hexadecimal for 1337
  //     chainName: 'Local Dev Network',
  //     rpcUrls: ['http://127.0.0.1:9545'],
  //     nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  //     // Optional: blockExplorerUrls: [...]
  //   }]
  // });
  const provider = new BrowserProvider((window as any).ethereum)
  await provider.send('eth_requestAccounts', [])
  const signer = await provider.getSigner()
  const contract = new Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, signer)
  // const tx = await contract.vote(candidateId)
}

// export async function cancelVoting() {
//   const provider = new JsonRpcProvider('http://127.0.0.1:9545')
//   const adminWallet = new Wallet(ADMIN_PRIVATE_KEY, provider)
//   const contract = new Contract(
//     VOTING_CONTRACT_ADDRESS,
//     VOTING_ABI,
//     adminWallet
//   )

//   const tx = await contract.cancelVoting()
//   return await tx.wait()
// }
