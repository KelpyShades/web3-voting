import { SignOutButton, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { votingSession } from '../Global/MockData'
import ClientOnlyVotingForm from './components/ClientOnlyVotingForm'
import { redirect } from 'next/navigation'

// admin dashboard page
export default async function AdminPage() {
  const user = await currentUser()
  const role = user?.publicMetadata?.role

  if (role !== 'admin') {
    // alert('You are not authorized to access this page')
    // redirect('/')

    return (
      <div className="flex min-h-screen w-screen flex-col items-center justify-center gap-4">
        <p>You are not authorized to access this page</p>
        <div className="flex flex-col items-center gap-2">
          <Link href="/">Go to home</Link>
          <SignOutButton>
            <Button>Sign Out</Button>
          </SignOutButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-[clamp(20rem,80vw,40rem)] flex-1 flex-col">
      {/* Show theres no ongoing voting session */}
      <ClientOnlyVotingForm />
    </div>
  )
}
