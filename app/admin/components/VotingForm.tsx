'use client'

import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar24 } from '@/components/ui/date-time'
import { Separator } from '@/components/ui/separator'

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import DeleteSessionDialog from './DeleteSessionDialog'
import SessionCreated from './SessionCreated'
import { createVotingSession } from '@/app/ethers/transactions'

const schema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    candidates: z
      .array(
        z.object({
          name: z.string().min(1, 'Candidate name is required'),
          party: z.string().min(1, 'Candidate party is required'),
        })
      )
      .min(2, 'At least 2 candidates'),
  })
  .refine(
    (v) => {
      const s = Date.parse(v.startTime)
      const e = Date.parse(v.endTime)
      if (Number.isNaN(s) || Number.isNaN(e)) return true
      return s < e
    },
    { message: 'End time must be after start time', path: ['endTime'] }
  )
  .refine(
    (v) => {
      const s = Date.parse(v.startTime)
      const e = Date.parse(v.endTime)
      if (Number.isNaN(s) || Number.isNaN(e)) return true
      return s > Date.now()
    },
    { message: 'Start time must be in the future', path: ['startTime'] }
  )
  .superRefine((v, ctx) => {
    // Case-insensitive, trim; attach error to the duplicate field
    const seen = new Map<string, number>()
    v.candidates.forEach((c, idx) => {
      const key = c.name.trim().toLowerCase()
      if (!key) return
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom' as const,
          path: ['candidates', idx, 'name'],
          message: 'Candidate name must be unique',
        })
      } else {
        seen.set(key, idx)
      }
    })
  })

type FormValues = z.infer<typeof schema>

export default function VotingForm() {
  const {
    getCandidatesCount,
    incrementCandidatesCount,
    setIsVotingSessionCreated,
    decrementCandidatesCount,
    isVotingSessionCreated,
    votingData,
  } = useVotingStore()

  // Build candidates default array based on current count
  const candidatesDefault = useMemo(
    () => Array.from({ length: getCandidatesCount() }, () => ({ name: '' })),
    [getCandidatesCount()]
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      startTime: '',
      endTime: '',
      candidates: candidatesDefault,
    },
    mode: 'onSubmit',
  })

  const onSubmit = (data: FormValues) => {
    createVotingSession(
      Date.now(),
      data.title,
      Math.floor(Date.parse(data.startTime) / 1000),
      Math.floor(Date.parse(data.endTime) / 1000),
      data.candidates
    )
  }

  if (isVotingSessionCreated) {
    return <SessionCreated resetForm={reset} />
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 pb-8">
      <Card className="w-full gap-4">
        <CardHeader>
          <CardTitle>Create Voting Session</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <CardContent className="flex flex-col gap-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Voting Session Title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:justify-between">
              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                {/* Wrap custom component with Controller */}
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <Calendar24 value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.startTime && (
                  <p className="text-xs text-red-500">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="flex items-stretch px-4">
                <Separator orientation="vertical" />
              </div>

              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <Calendar24 value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.endTime && (
                  <p className="text-xs text-red-500">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <Label htmlFor="candidates">Candidates and Parties</Label>
            <div className="flex flex-col gap-2">
              {Array.from({ length: getCandidatesCount() }).map((_, index) => (
                <div key={index} className="flex gap-1">
                  <div className="flex flex-1 flex-col gap-1">
                    <Input
                      className=""
                      id={`candidate-${index}`}
                      placeholder={`Candidate ${index + 1} name`}
                      {...register(`candidates.${index}.name` as const)}
                    />
                    {errors.candidates?.[index]?.name && (
                      <p className="text-xs text-red-500">
                        {errors.candidates[index]?.name?.message as string}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Input
                      id={`candidate-${index}`}
                      placeholder={`Candidate ${index + 1} party`}
                      {...register(`candidates.${index}.party` as const)}
                    />
                    {errors.candidates?.[index]?.party && (
                      <p className="text-xs text-red-500">
                        {errors.candidates[index]?.party?.message as string}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Optional: array-level error (e.g., from .min(2)) */}
              {'message' in (errors.candidates || {}) &&
                (errors.candidates as any).message && (
                  <p className="text-xs text-red-500">
                    {(errors.candidates as any).message}
                  </p>
                )}
            </div>
            <div className="flex gap-4">
              <Button type="button" onClick={decrementCandidatesCount}>
                -
              </Button>
              <Button type="button" onClick={incrementCandidatesCount}>
                +
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              onClick={() => {
                reset()
                useVotingStore.persist.clearStorage()
                // setIsVotingSessionCreated(false)
              }}
              variant="outline"
            >
              Clear
            </Button>
            <Button type="submit">Create</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
