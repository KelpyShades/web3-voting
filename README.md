## Web3 Voting dApp (Next.js + Clerk + Truffle + Ethers)

A full‑stack starter for creating secure, transparent voting sessions. The web app is built with Next.js App Router, Clerk authentication, Tailwind CSS, and Zustand for state. A Solidity `Voting` smart contract and Truffle configuration are included for on‑chain voting.

### Key Features
- **Authentication**: Clerk with MetaMask sign‑in; `/admin` routes protected by middleware
- **Admin dashboard**: Create a voting session with title, description, time window, and candidates
- **Form validation**: `react-hook-form` + `zod` (date sanity checks, unique candidate names, etc.)
- **State management**: Zustand store with localStorage persistence (hydrates from chain events)
- **Smart contracts**: Solidity `Voting` contract (Truffle, solc 0.8.0) with candidate management and time‑boxed voting
- **Blockchain integration**: Ethers v6 for on‑chain admin actions and live event syncing
- **UI**: Shadcn‑style components, Tailwind CSS v4, dark/light theme

Note: Admin create/delete now execute on‑chain and the UI live‑syncs from contract events. End‑user voting in the UI is still a local placeholder; wiring the vote action to the contract is the next step.

### Tech Stack
- Next.js 15 (App Router), React 19, TypeScript
- Clerk (`@clerk/nextjs`) for auth and MetaMask sign‑in
- Tailwind CSS v4
- Zustand for client state/persistence
- Truffle for contract tooling; Solidity 0.8.0; Ethers v6

---

## Project Structure

```
app/
  [votingSessionId]/
    components/
      CandidatesView.tsx
      VoteDialog.tsx
      VoteForm.tsx
      VotingView.tsx
    layout.tsx               # Voting layout
    page.tsx                 # Voting page (hydrate from store/events)
  admin/
    components/
      VotingForm.tsx         # Admin form to create a voting session (on‑chain)
      SessionCreated.tsx     # Success screen after creating a session
      DeleteSessionDialog.tsx# Deletes session on‑chain
    layout.tsx               # Admin layout with header and UserButton
    page.tsx                 # Admin dashboard (role-gated)
  ethers/
    events.ts                # Ethers event sync → Zustand
    transactions.ts          # Ethers admin tx (create/delete); vote stub
    eventClient.tsx          # Starts event sync on client
  ZustandStores/
    VotingStore.ts           # Session state (projection of chain state)
    VoterStore.ts            # Local voter id store
  AuthWatcher.tsx            # Clears persisted store on sign-out
  layout.tsx                 # Root layout; wraps app in ClerkProvider + EventClient
  page.tsx                   # Marketing/homepage with MetaMask sign-in CTA

components/ui/               # Button, Card, Dialog, etc. (shadcn-style)
lib/utils.ts                 # Utility (cn)
middleware.ts                # Protects /admin routes via Clerk
next.config.ts               # Next.js config

blockchain/
  contracts/voting.sol       # Solidity contracts (Voting, Migrations)
  migrations/                # Truffle migration scripts
  truffle-config.js          # Truffle network/compiler config (port 9545)
  build/contracts/*.json     # ABIs after compile/migrate

server.js                    # Example Web3 connection to local chain (9545)
```

---

## App Overview

### Home (`app/page.tsx`)
- Shows brand header, theme toggle, and CTA
- If authenticated, links to `/admin`; otherwise shows MetaMask sign-in via Clerk

### Admin (`app/admin/page.tsx` and `app/admin/components/*`)
- **Role-gated**: reads `user.publicMetadata.role` from Clerk; only `admin` may access
- **Create session (on‑chain)**: `VotingForm.tsx` validates input (dates, unique candidate names) then calls `createVoting(...)` via ethers
- **Delete session (on‑chain)**: `DeleteSessionDialog.tsx` calls `deleteVoting()`
- **SessionCreated**: shows details and a shareable link `/{votingId}`

### Voting route (`app/[votingSessionId]/*`)
- Renders session details, countdowns, candidate list and charts from the store (which is hydrated by contract events)
- Vote dialog exists but currently updates only local store; contract vote wiring is pending

### Authentication & Protection
- Clerk middleware (`middleware.ts`) protects `/admin(.*)` and requires auth
- `AuthWatcher.tsx` clears any persisted session data if the user signs out

### State Management
- `Zustand` store (`app/ZustandStores/VotingStore.ts`) persists under `voting-session` and acts as a projection of on‑chain state
- `EventClient` boots `startVotingEventsSync()` to hydrate from past events and subscribe to `VotingCreated`, `Voted`, and `VotingDeleted`

---

## Smart Contracts (Truffle)

Solidity: `blockchain/contracts/voting.sol` (pragma 0.8.0)

- `createVoting(votingId, title, start, end, Candidate[])` (admin only): sets dates, registers candidates, emits `VotingCreated`
- `deleteVoting()`/`cancelVoting()` (admin only, not during active voting): clears state, emits `VotingDeleted`
- `vote(candidateId, voterId)` (any): enforces time window and double‑vote prevention, increments tally, emits `Voted(candidateId, newCount)`
- `checkVote(voterId)` (view): returns whether the voter has already voted
- `getCountCandidates()`, `getCandidate(id)`, `getCandidates()`, `getDates()` (several read functions are admin‑gated)

Truffle config (`blockchain/truffle-config.js`):
- Network `development` at `127.0.0.1:9545` (compatible with `truffle develop`/Ganache)
- Compiler `solc` version `0.8.0`

---

## Prerequisites
- Node.js 18+
- npm
- Clerk account (for auth)
- Truffle CLI and a local blockchain (e.g., `truffle develop` or Ganache) on port `9545`

---

## Getting Started

1) Install dependencies
```
npm install
```

2) Configure Clerk environment variables
Create a `.env.local` in the project root with:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

3) Optional: Set an admin role for your user in Clerk
- In Clerk Dashboard → Users → your user → Public metadata:
```
{
  "role": "admin"
}
```

3) Compile and deploy contracts (local chain)
```
cd blockchain
truffle develop
truffle(develop)> compile
truffle(develop)> migrate --reset
```
Artifacts will appear in `blockchain/build/contracts/` and include a deployed address at `Voting.json.networks[5777].address`.

4) Run the Next.js app
```
npm run dev
```

---

## On‑chain Integration in the App

- Ethers v6 is already integrated. The app reads artifacts from `blockchain/build/contracts/Voting.json` and uses:
  - `WebSocketProvider` at `ws://127.0.0.1:9545` for live events (`VotingCreated`, `Voted`, `VotingDeleted`) → store sync
  - `JsonRpcProvider` at `http://127.0.0.1:9545` for admin transactions
- Admin transactions (`app/ethers/transactions.ts`):
  - `createVotingSession(...)` → `createVoting(...)`
  - `deleteVotingSession()` → `deleteVoting()`
  - `vote(candidateId, voterId)` exists but the UI vote dialog currently updates only local store
- Configuration (`app/ethers/events.ts`):
  - `VOTING_CONTRACT_ADDRESS` is sourced from the artifact (`Voting.json.networks[5777].address`)
  - `PROVIDER_WS_URL` defaults to `ws://127.0.0.1:9545`

Security note: The sample includes a hard‑coded local dev private key for admin transactions. Do not use this in production. Prefer MetaMask/Clerk‑gated actions or move secrets to a secure server/API.

---

## Troubleshooting
- **Clerk auth errors**: ensure `.env.local` keys are correct and the app origin is allowed in Clerk
- **Unauthorized admin**: set your Clerk user `publicMetadata.role="admin"`
- **Truffle compile errors**: use Node LTS and ensure `solc 0.8.0` is used (per `blockchain/truffle-config.js`)
- **Event sync not working**: make sure your local node exposes WebSocket at `ws://127.0.0.1:9545` (Ganache/Anvil/Hardhat). Adjust `PROVIDER_WS_URL` if needed
- **Contract address undefined**: verify `blockchain/build/contracts/Voting.json` has `networks[5777].address` after migrate, and that the app points to that artifact path

---

## Roadmap
- Wire the UI vote dialog to `vote(candidateId, voterId)` on‑chain
- Replace hard‑coded admin key with MetaMask or a secure backend flow
- Add read views for session status and candidate tallies (partially done)
- Persist sessions to a backend or fully on‑chain
- E2E tests for critical flows

---

## License
MIT
