import React from 'react'
import { useTimer } from 'react-timer-hook'

export function Timer({
  expiryTimestamp,
}: {
  expiryTimestamp: Date
  className?: string
}) {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      window.location.reload()
    },
    interval: 1000,
  })

  return (
    <div className="flex items-center justify-center text-4xl font-bold md:text-6xl lg:text-5xl">
      <span>
        {days}
        <span className="text-sm">d</span> <span className="text-xl">:</span>
      </span>
      <span>
        {hours}
        <span className="text-sm">h</span> <span className="text-xl">:</span>
      </span>
      <span>
        {minutes}
        <span className="text-sm">m</span> <span className="text-xl">:</span>
      </span>
      <span>
        {seconds}
        <span className="text-sm">s</span>
      </span>
    </div>
  )
}
