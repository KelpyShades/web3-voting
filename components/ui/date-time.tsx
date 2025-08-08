'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Calendar24Props = {
  value?: string // ISO string
  onChange?: (iso: string) => void
}

function toTimeString(date?: Date) {
  if (!date) return '10:30:00'
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function combine(date: Date | undefined, timeStr: string): string {
  if (!date) return ''
  const [hh, mm, ss] = (timeStr || '00:00:00').split(':').map(Number)
  const next = new Date(date)
  next.setHours(hh || 0, mm || 0, ss || 0, 0)
  return next.toISOString()
}

export function Calendar24({ value, onChange }: Calendar24Props) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(() =>
    value ? new Date(value) : undefined
  )
  const [time, setTime] = React.useState<string>(() =>
    toTimeString(value ? new Date(value) : undefined)
  )

  // keep local state in sync if parent value changes
  React.useEffect(() => {
    if (!value) return
    const d = new Date(value)
    setDate(d)
    setTime(toTimeString(d))
  }, [value])

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(d) => {
                setDate(d)
                setOpen(false)
                onChange?.(combine(d ?? undefined, time))
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={(e) => {
            const t = e.target.value
            setTime(t)
            onChange?.(combine(date, t))
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}
