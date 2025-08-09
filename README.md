## Web3 Voting dApp (Next.js + Clerk + Truffle)

A full‑stack starter for creating secure, transparent voting sessions. The web app is built with Next.js App Router, Clerk authentication, Tailwind CSS, and Zustand for state. A Solidity `Voting` smart contract and Truffle configuration are included for on‑chain voting.

### Key Features
- **Authentication**: Clerk with MetaMask sign‑in; `/admin` routes protected by middleware
- **Admin dashboard**: Create a voting session with title, description, time window, and candidates
- **Form validation**: `react-hook-form` + `zod` (date sanity checks, unique candidate names, etc.)
- **State management**: Zustand store with localStorage persistence
- **Smart contracts**: Solidity `Voting` contract (Truffle, solc 0.5.15) with candidate management and time‑boxed voting
- **UI**: Shadcn‑style components, Tailwind CSS v4, dark/light theme

Note: The current UI persists sessions locally (Zustand) and does not yet submit blockchain transactions. The Truffle project is provided to wire up on‑chain flows next.

### Tech Stack
- Next.js 15 (App Router), React 19, TypeScript
- Clerk (`@clerk/nextjs`) for auth and MetaMask sign‑in
- Tailwind CSS v4
- Zustand for client state/persistence
- Truffle for contract tooling; Solidity 0.5.15

---

## Project Structure

```
app/
  admin/
    components/
      VotingForm.tsx        # Admin form to create a voting session
      SessionCreated.tsx    # Success screen after creating a session
      DeleteSessionDialog.tsx
    layout.tsx              # Admin layout with header and UserButton
    page.tsx                # Admin dashboard (role-gated)
    [sessionId]/page.tsx    # Placeholder for session-specific admin view
  voting/
    page.tsx                # Placeholder: route that handles session routing
    [sessionId]/page.tsx    # Placeholder: voting view per session
  ZustandStores/
    VotingStore.ts          # Zustand store for session data
  AuthWatcher.tsx           # Clears persisted store on sign-out
  layout.tsx                # Root layout; wraps app in ClerkProvider
  page.tsx                  # Marketing/homepage with MetaMask sign-in CTA

components/ui/              # Button, Card, Dialog, etc. (shadcn-style)
lib/utils.ts                # Utility (cn)
middleware.ts               # Protects /admin routes via Clerk
next.config.ts              # Next.js config

reactproject/
  contracts/voting.sol      # Solidity contracts (Voting, Migrations)
  truffle-config.js         # Truffle network/compiler config (port 9545)
  build/contracts/*.json    # ABIs after compile/migrate

server.js                   # Example Web3 connection to local chain (9545)
browser/launch.json         # Firefox debug configuration (optional)
```

---

## App Overview

### Home (`app/page.tsx`)
- Shows brand header, theme toggle, and CTA
- If authenticated, links to `/admin`; otherwise shows MetaMask sign-in via Clerk

### Admin (`app/admin/page.tsx` and `app/admin/components/*`)
- Role-gated: reads `user.publicMetadata.role` from Clerk; only `admin` may access
- `VotingForm.tsx` creates a session in the client store with:
  - Title, description
  - Start/end timestamps (must be future start, end after start)
  - 2+ candidate names, case-insensitive uniqueness
- On success, shows `SessionCreated`

### Voting routes (`app/voting/*`)
- Placeholders for user voting flow and session views. Intended to read the created session (from store or on‑chain) and allow participants to cast votes.

### Authentication & Protection
- Clerk middleware (`middleware.ts`) protects `/admin(.*)` and requires auth
- `AuthWatcher.tsx` clears any persisted session data if the user signs out

### State Management
- `Zustand` store (`app/ZustandStores/VotingStore.ts`) persists session data under `voting-session` in `localStorage`
- Exposes helpers to create sessions and manage candidate count

---

## Smart Contracts (Truffle)

Solidity: `reactproject/contracts/voting.sol` (pragma 0.5.15)

- `addCandidate(name, party)` (pre‑start only): Registers a candidate; returns candidate ID
- `setDates(start, end)`: One‑time configuration; `start > now`, `end > start`
- `vote(candidateId)`: Enforces time window, prevents double voting, increments chosen candidate's count, and emits `Voted(candidateId)`
- `checkVote()`: Returns whether `msg.sender` has already voted
- `getCountCandidates()`, `getCandidate(id)`, `getDates()` helpers

Truffle config (`reactproject/truffle-config.js`):
- Network `development` at `127.0.0.1:9545` (compatible with `truffle develop`)
- Compiler `solc` version `0.5.15`

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

4) Run the Next.js app
```
npm run dev
```

5) Compile and deploy contracts (local chain)
```
cd reactproject
truffle develop
truffle(develop)> compile
truffle(develop)> migrate --reset
```
Artifacts will appear in `reactproject/build/contracts/`.

---

## Using the Contract in the App (next step)

The UI is currently using a client store as a placeholder. To enable on‑chain voting:
- Install a web3 library in the web app (choose one):
  - `npm i ethers` (recommended) or `npm i web3`
- Load the contract ABI and address from `reactproject/build/contracts/Voting.json`
- Connect a provider (e.g., MetaMask’s injected provider) and a signer
- Replace store actions (e.g., create session, cast vote) with contract calls

Example outline (ethers v6):
```ts
import { BrowserProvider, Contract } from 'ethers'
import votingArtifact from '@/../reactproject/build/contracts/Voting.json'

const provider = new BrowserProvider((window as any).ethereum)
const signer = await provider.getSigner()
const contract = new Contract(
  deployedAddress,
  votingArtifact.abi,
  signer
)

await contract.setDates(startTs, endTs)
await contract.addCandidate('Alice', 'Independent')
await contract.vote(1)
```

Note: `server.js` shows connecting `web3` to `http://127.0.0.1:9545`, but the web app does not currently import it. Prefer client‑side connection via MetaMask for transactions initiated by users, and keep private keys client‑side.

---

## Troubleshooting
- Clerk auth errors: ensure `.env.local` keys are correct and the app origin is allowed in Clerk
- `admin` page shows “not authorized”: set your Clerk user `publicMetadata.role="admin"`
- Truffle compile errors: use Node LTS and ensure `solc 0.5.15` is used (per `truffle-config.js`)
- Cannot connect to chain: start `truffle develop` (port 9545) or configure Ganache to 9545

---

## Roadmap
- Wire up contract ABI/address in the Next.js app and replace Zustand-only flow
- Add read views for session status and candidate tallies
- Add events/subscriptions to reflect live vote counts
- Persist sessions to a backend or the blockchain entirely
- E2E tests for critical flows

---

## License
MIT
