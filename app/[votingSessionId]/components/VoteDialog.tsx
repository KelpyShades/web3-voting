'use client'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useVoterStore } from '@/app/ZustandStores/VoterStore'
import DeleteSessionDialog from '@/app/admin/components/DeleteSessionDialog'
import { useState } from 'react'
import { SelectForm } from './VoteForm'

const votingIdSchema = z.object({
  votingId: z
    .string()
    .min(6, { message: 'Voting ID is required' })
    .refine((val) => val.toLowerCase().startsWith('ueb'), {
      message: 'Invalid Voting ID',
    }),
})

type VotingIdFormValues = z.infer<typeof votingIdSchema>

export default function VoteDialog() {
  const { votingData } = useVotingStore()
  const [isVoting, setIsVoting] = useState(false)
  // const { voterId, setVoterId } = useVoterStore()
  if (!votingData) return null
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VotingIdFormValues>({
    resolver: zodResolver(votingIdSchema),
    defaultValues: {
      votingId: '',
    },
  })
  const onSubmit = (data: VotingIdFormValues) => {
    setIsVoting(true)
    // setVoterId(data.votingId)
    // request to server to check if the voter is eligible to vote
    // if the voter is eligible to vote, show the vote dialog
  }
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          reset()
          setIsVoting(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-[40%]">Vote</Button>
      </DialogTrigger>
      <DialogContent>
        {isVoting ? (
          <div className="flex flex-col gap-4 w-full">
            <DialogHeader>
              <DialogTitle>Vote</DialogTitle>
            </DialogHeader>
            <SelectForm />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <DialogHeader className="flex flex-col gap-4">
              <DialogTitle>Voting Id Confirmation</DialogTitle>
              <DialogDescription className="flex flex-col gap-4">
                <span className="text-muted-foreground text-sm">
                  Please to vote enter your voting id (Student ID)
                </span>
                <Input
                  type="text"
                  placeholder="Voting ID (Student ID)"
                  {...register('votingId')}
                />
                {errors.votingId && (
                  <span className="text-sm text-red-500">
                    {errors.votingId.message}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-center">
              <Button className="w-[40%]" type="submit">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
