import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import Image from 'next/image'

export default function CandidatePreview() {
  const { votingData } = useVotingStore()
  if (!votingData) return null
  return (
    <div className="flex flex-wrap gap-3">
      {votingData.candidates.map((candidate, index) => (
        <div
          key={candidate.id}
          style={{
            backgroundColor: `var(--chart-${candidate.id})`,
          }}
          className="flex flex-col gap-2 rounded-2xl border p-3"
        >
          <Image
            src={candidate.imageUrl}
            alt={candidate.name}
            width={200}
            height={200}
            className="mx-auto size-60 rounded-lg object-cover"
            priority
          />
          <span className="text-xs font-medium text-black">#{index + 1}</span>
          <div className="flex-1">
            <p className="overflow-hidden font-bold text-ellipsis whitespace-nowrap text-black">
              {candidate.name}
            </p>
            <p className="overflow-hidden text-sm text-ellipsis whitespace-nowrap text-black">
              {candidate.party}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
