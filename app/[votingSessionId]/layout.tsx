import Theme from '@/components/ui/theme'

export default function VotingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center overflow-x-hidden">
      <header className="flex h-10 w-full items-center justify-between p-8">
        <p className="text-md font-bold md:text-xl">Web3Voting</p>
        <div className="flex items-center gap-4">
          <Theme />
        </div>
      </header>
      {children}
    </div>
  )
}
