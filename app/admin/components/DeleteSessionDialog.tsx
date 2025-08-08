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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'

type DeleteFormValues = {
  title: string
}

const deleteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .refine((v) => v === useVotingStore.getState().votingData.title, {
      message: 'Title does not match',
    }),
})

export default function DeleteSessionDialog({
  onDelete,
}: {
  onDelete: () => void
}) {
  const { votingData } = useVotingStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      title: '',
    },
  })

  const onSubmit = (data: DeleteFormValues) => {
    if (data.title === votingData.title) {
      onDelete()
      reset()
    }
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
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Voting Session</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <DialogDescription>
            Are you sure you want to delete this voting session? This action is
            irreversible.
            <br />
            <br />
            <span className="text-sm">
              Enter{' "'}
              <span className="font-bold text-black">{votingData.title}</span>
              {'" '}
              to delete it.
            </span>
            <Input
              type="text"
              placeholder="Enter the title to delete"
              {...register('title')}
            />
            {errors.title && (
              <span className="text-xs font-bold text-red-500">
                {errors.title.message}
              </span>
            )}
          </DialogDescription>
          <DialogFooter>
            <Button type="submit">Delete</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
