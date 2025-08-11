'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useVotingStore } from '@/app/ZustandStores/VotingStore'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'

const FormSchema = z.object({
  candidate: z.string().min(1, {
    message: 'Please select a candidate to display.',
  }),
})

export function SelectForm() {
  const { votingData, vote } = useVotingStore()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    vote(parseInt(data.candidate))
    const closeButton = document.querySelector('[data-slot="dialog-close"]')
    if (closeButton instanceof HTMLElement) {
      closeButton.click()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4 space-y-6"
      >
        <FormField
          control={form.control}
          name="candidate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="w-full">Candidate</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a candidate" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {votingData.candidates.map((candidate) => (
                    <SelectItem
                      key={candidate.id}
                      value={candidate.id.toString()}
                    >
                      {candidate.party} - {candidate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-1/3 self-end">
          Submit Vote
        </Button>
      </form>
    </Form>
  )
}
