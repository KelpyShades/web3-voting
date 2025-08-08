import { SignInWithMetamaskButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { SunIcon, MoonIcon } from 'lucide-react'
import Theme from '@/components/ui/theme'
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <header className="flex h-10 w-full items-center justify-between p-8">
        <p className="font-poppins text-xl font-bold">Web3Voting</p>
        <div className="flex items-center gap-4">
          <Theme />
          <UserButton />
        </div>
      </header>
      {children}
    </div>
  )
}
