'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const VotingPageComponent = dynamic(() => import('../VotingPageContent'), {
  ssr: false,
  loading: () => (
    <div className="flex w-full flex-1 flex-col items-center gap-8 py-8 lg:flex-row lg:px-8">
      {/* Voting details section */}
      <div className="flex w-full flex-col items-center justify-center p-4">
        <div className="w-full md:w-[80vw] lg:w-full">
          <div className="animate-pulse rounded-lg border bg-white shadow-sm">
            {/* Card Header */}
            <div className="p-6 pb-0">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="h-6 w-1/2 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              <div className="space-y-8">
                {/* Start/End times */}
                <div className="flex justify-evenly gap-2">
                  <div className="flex flex-col items-start gap-2">
                    <div className="h-4 w-12 rounded bg-gray-200"></div>
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="flex flex-col items-start gap-2">
                    <div className="h-4 w-12 rounded bg-gray-200"></div>
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </div>
                </div>

                {/* Timer section */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-16 w-48 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-6 pt-0">
              <div className="flex w-full justify-between">
                <div className="h-10 w-24 rounded bg-gray-200"></div>
                <div className="h-10 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie chart section */}
      <div className="flex h-[40vh] w-min flex-col items-center justify-center md:h-[50vh] lg:h-[60vh]">
        <div className="animate-pulse">
          <div className="h-64 w-64 rounded-full bg-gray-200 md:h-80 md:w-80 lg:h-96 lg:w-96"></div>
        </div>
      </div>

      {/* Candidates section */}
      <div className="flex w-full flex-col items-center justify-center px-4 md:w-[80vw] lg:w-full">
        <div className="scrollbar-hide flex max-h-[80vh] w-full flex-col gap-4 lg:overflow-y-auto">
          {/* Candidate 1 placeholder */}
          <div className="animate-pulse rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-4">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="h-5 w-32 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex gap-10">
                <div className="h-25 w-25 rounded-lg bg-gray-200"></div>
                <div className="flex flex-col justify-center gap-2">
                  <div className="h-6 w-20 rounded bg-gray-200"></div>
                  <div className="h-6 w-16 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate 2 placeholder */}
          <div className="animate-pulse rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-4">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="h-5 w-28 rounded bg-gray-200"></div>
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex gap-10">
                <div className="h-25 w-25 rounded-lg bg-gray-200"></div>
                <div className="flex flex-col justify-center gap-2">
                  <div className="h-6 w-20 rounded bg-gray-200"></div>
                  <div className="h-6 w-16 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
})

export default function ClientOnlyVotingPage() {
  return <VotingPageComponent />
}
