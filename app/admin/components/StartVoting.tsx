import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import {
  deleteVotingSession,
  startVotingImmediately,
} from '@/app/ethers/transactions'
import { Calendar24 } from '@/components/ui/date-time'
import { Label } from '@/components/ui/label'

type DeleteFormValues = {
  endTime: string
}

const deleteSchema = z.object({
  endTime: z
    .string()
    .min(1, 'End time is required')
    .refine((v) => new Date(v) > new Date(), {
      message: 'End time must be in the future',
    })
    .refine((v) => new Date(v) > new Date(Date.now() + 1000 * 60 * 60), {
      message: 'End time must be at least 1 hour from now',
    }),
})

export default function StartVoting() {
  const { votingData } = useVotingStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      endTime: '',
    },
  })

  const onSubmit = (data: DeleteFormValues) => {
    startVotingImmediately(Math.floor(Date.parse(data.endTime) / 1000))
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          reset()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Start Voting</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Voting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogDescription>
            Are you sure you want to start voting immediately? This action is
            irreversible.
          </DialogDescription>
          <section className="flex w-full flex-col gap-2">
            <Label htmlFor="endTime">End Time</Label>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <Calendar24 value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.endTime && (
              <p className="text-xs text-red-500">{errors.endTime.message}</p>
            )}
          </section>
          <DialogFooter>
            <Button type="submit">Start Voting</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
