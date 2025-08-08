import { Button } from '@/components/ui/button'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import {
  SignInWithMetamaskButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Theme from '@/components/ui/theme'

export default async function Home() {
  const user = await currentUser()
  // if (user) {
  //   redirect('/admin')
  // }

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-items-center">
      {/* nav bar */}
      <header className="flex h-10 w-full items-center justify-between p-8">
        <p className="font-poppins text-md md:text-xl font-bold">Web3Voting</p>
        <div className="flex items-center gap-4">
          <Theme />
          {user ? (
            <Link href="/admin">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <SignInWithMetamaskButton redirectUrl="/admin">
              <Button>Get Started</Button>
            </SignInWithMetamaskButton>
          )}
          <UserButton />
        </div>
      </header>
      {/* main content */}
      <main className="flex flex-1 flex-col items-center justify-center">
        <article className="flex w-[clamp(18rem,80vw,60rem)] flex-col items-center justify-center gap-6">
          <h1 className="font-poppins text-xl leading-tight font-bold sm:text-4xl">
            Create secure, transparent voting sessions with blockchain
            technology. Perfect for organizations, communities, and events.
          </h1>
          <p className="font-poppins w-full text-sm sm:text-xl">
            Simple, secure, and transparent voting for your organization.
          </p>
          <div className="w-full">
            {!user && (
              <SignInWithMetamaskButton redirectUrl="/admin">
                <Button className="w-60">Get Started</Button>
              </SignInWithMetamaskButton>
            )}
          </div>
        </article>
      </main>
      {/* footer */}
    </div>
  )
}
