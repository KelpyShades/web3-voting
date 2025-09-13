'use client'

import dynamic from 'next/dynamic'

const VotingFormComponent = dynamic(() => import('./VotingForm'), {
  ssr: false,
  loading: () => (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 pb-8">
      <div className="w-full max-w-2xl">
        <div className="animate-pulse rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {/* Title placeholder */}
            <div className="h-6 w-1/3 rounded bg-gray-200"></div>

            {/* Form fields placeholders */}
            <div className="space-y-4">
              <div className="h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="h-10 rounded bg-gray-200"></div>
            </div>

            {/* Date fields placeholders */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                <div className="h-10 rounded bg-gray-200"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                <div className="h-10 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Candidates section placeholder */}
            <div className="space-y-4">
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="space-y-4">
                {/* Candidate 1 */}
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-10 rounded bg-gray-200"></div>
                    <div className="h-10 rounded bg-gray-200"></div>
                  </div>
                </div>
                {/* Candidate 2 */}
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-10 rounded bg-gray-200"></div>
                    <div className="h-10 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons placeholder */}
            <div className="flex justify-between">
              <div className="h-10 w-20 rounded bg-gray-200"></div>
              <div className="h-10 w-20 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
})

export default function ClientOnlyVotingForm() {
  return <VotingFormComponent />
}
