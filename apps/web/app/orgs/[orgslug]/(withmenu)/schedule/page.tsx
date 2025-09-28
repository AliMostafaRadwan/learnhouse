'use client'
import React from 'react'
import { use } from 'react'
import ScheduleBuilder from '@components/Dashboard/Pages/Schedule/ScheduleBuilder'

export default function SchedulePage(props: {
  params: Promise<{ orgslug: string }>
}) {
  const params = use(props.params)

  return (
    <div className="min-h-screen bg-gray-50">
      <ScheduleBuilder />
    </div>
  )
}
