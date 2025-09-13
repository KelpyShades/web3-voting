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
import { ImageUpload } from '@/components/ui/image-upload'

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import DeleteSessionDialog from './DeleteSessionDialog'
import SessionCreated from './SessionCreated'
import { createVotingSession } from '@/app/ethers/transactions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'
import { uploadMultipleCandidateImages } from '@/app/supabase/storage'

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
          image: z
            .instanceof(File, {
              message: 'Image is required',
            })
            .refine((file) => file.size <= 10 * 1024 * 1024, {
              message: 'Image must be less than 10MB',
            }),
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Build candidates default array based on current count
  const candidatesDefault = useMemo(
    () =>
      Array.from({ length: getCandidatesCount() }, () => ({
        name: '',
        party: '',
        image: undefined,
      })),
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Debug: Log form data before upload
      console.log('Form submission data:')
      data.candidates.forEach((candidate, index) => {
        console.log(`Candidate ${index + 1}:`, {
          name: candidate.name,
          party: candidate.party,
          imageName: candidate.image.name,
          imageSize: candidate.image.size,
          imageType: candidate.image.type,
          imageLastModified: candidate.image.lastModified,
        })
      })

      // Upload images to Supabase first
      console.log('Uploading candidate images...')
      const candidatesWithImages = await uploadMultipleCandidateImages(
        data.candidates as Array<{ name: string; party: string; image: File }>
      )

      console.log('Images uploaded successfully:', candidatesWithImages)

      // Create voting session on blockchain with image URLs
      const candidatesForBlockchain = candidatesWithImages.map((candidate) => ({
        name: candidate.name,
        party: candidate.party,
        imageUrl: candidate.imageUrl,
      }))

      await createVotingSession(
        Date.now(),
        data.title,
        Math.floor(Date.parse(data.startTime) / 1000),
        Math.floor(Date.parse(data.endTime) / 1000),
        candidatesForBlockchain
      )

      console.log('Voting session created successfully')
    } catch (error) {
      console.error('Error creating voting session:', error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to create voting session. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
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
            {submitError && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
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
            <div className="flex flex-col gap-8">
              {Array.from({ length: getCandidatesCount() }).map((_, index) => (
                <div key={index} className="flex flex-col gap-4 md:flex-row">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <Controller
                      name={`candidates.${index}.image` as const}
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          className="max-sm:w-2/3"
                          onBlur={field.onBlur}
                          placeholder={`Upload image for candidate ${index + 1}`}
                          maxSize={10}
                          error={
                            errors.candidates?.[index]?.image?.message as string
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-2 flex-col justify-start gap-4">
                    <div className="flex flex-col gap-1">
                      <Input
                        className=""
                        id={`candidate-name-${index}`}
                        placeholder={`Candidate ${index + 1} name`}
                        {...register(`candidates.${index}.name` as const)}
                      />
                      {errors.candidates?.[index]?.name && (
                        <p className="text-xs text-red-500">
                          {errors.candidates[index]?.name?.message as string}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Input
                        id={`candidate-party-${index}`}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Session...' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
