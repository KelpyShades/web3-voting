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
import { useVoterStore } from '@/app/ZustandStores/VoterStore'
import { useState } from 'react'
import {
  vote,
} from '@/app/ethers/transactions'

const FormSchema = z.object({
  candidate: z.string().min(1, {
    message: 'Please select a candidate to display.',
  }),
})

export function SelectForm() {
  const { votingData } = useVotingStore()
  const { getVoterKey, getVoterAddress, clearVoterId } = useVoterStore()
  const [voted, setVoted] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {

    vote(
      parseInt(data.candidate),
      getVoterAddress().trim(),
      getVoterKey().trim()
    )

     setVoted(true)
  }

  function voteClose() {
    const closeButton = document.querySelector('[data-slot="dialog-close"]')
    clearVoterId()
    if (closeButton instanceof HTMLElement) {
      closeButton.click()
    }
  }

  return (
    <>
      {voted ? (
        <div className="flex flex-col items-center justify-center gap-8">
          <span className="text-2xl font-bold">Thanks for voting!</span>
          <Button onClick={voteClose}>Close</Button>
        </div>
      ) : (
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
      )}
    </>
  )
}
