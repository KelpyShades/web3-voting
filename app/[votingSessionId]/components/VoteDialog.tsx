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
import { createClient } from '@/utils/supabase/client'
import { checkVoterHasVoted } from '@/app/ethers/transactions'

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
  const supabase = createClient()
  const [isVoting, setIsVoting] = useState(false)
  const { voterId, setVoter, getVoterKey } = useVoterStore()
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
  const onSubmit = async (data: VotingIdFormValues) => {
    const { data: voter, error } = await supabase
      .from('voters')
      .select('*')
      .eq('index_number', data.votingId.trim().toUpperCase())
      .limit(1)
      .maybeSingle()
    if (error) {
      if (error.details.includes('The result contains 0 rows')) {
        alert('Voter ID not found. Please check your ID and try again.')
      }
      return
    }
    if (voter === null) {
      alert('Voter ID not found. Please check your ID and try again.')
      return
    }
    if (voter) {
      const voterAddress = voter.address

      const hasVoted = await checkVoterHasVoted(voterAddress, voter.private_key)
      if (hasVoted) {
        alert('You have already voted')
        return
      }
      // setVoterId(data.votingId)
    }
    setVoter(data.votingId, voter.address, voter.private_key)
    setIsVoting(true)
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
          <div className="flex w-full flex-col gap-4">
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
