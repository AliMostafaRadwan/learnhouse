'use client'
import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, BookOpen, Lock, Unlock } from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getUserSchedule, ScheduleWithDetails, ScheduledCourseWithDetails, toggleScheduleLock } from '@services/scheduling/schedules'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'
import { cn } from '@/lib/utils'

// Time slots configuration (8:30 AM to 4:30 PM, 55-minute intervals)
const TIME_SLOTS = [
  { time: '8:30', label: '8:30 AM' },
  { time: '9:25', label: '9:25 AM' },
  { time: '10:20', label: '10:20 AM' },
  { time: '11:15', label: '11:15 AM' },
  { time: '12:10', label: '12:10 PM' },
  { time: '13:05', label: '1:05 PM' },
  { time: '14:00', label: '2:00 PM' },
  { time: '14:55', label: '2:55 PM' },
  { time: '15:50', label: '3:50 PM' },
  { time: '16:45', label: '4:45 PM' },
]

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

// Course type colors
const COURSE_TYPE_COLORS = {
  'Lecture': 'bg-blue-100 border-blue-300 text-blue-800',
  'Section': 'bg-green-100 border-green-300 text-green-800',
  'Lab': 'bg-purple-100 border-purple-300 text-purple-800',
  'Tutorial': 'bg-orange-100 border-orange-300 text-orange-800',
  'Seminar': 'bg-pink-100 border-pink-300 text-pink-800',
}

interface ScheduleBlockProps {
  scheduledCourse: ScheduledCourseWithDetails
  colSpan: number
}

function ScheduleBlock({ scheduledCourse, colSpan }: ScheduleBlockProps) {
  const { course, course_offering, time_slot } = scheduledCourse
  const colorClass = COURSE_TYPE_COLORS[course_offering.course_type] || 'bg-gray-100 border-gray-300 text-gray-800'
  
  return (
    <div
      className={cn(
        'p-2 rounded-md border-2 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        colorClass
      )}
      style={{ gridColumn: `span ${colSpan}` }}
      title={`${course.name} - ${course_offering.course_type} - ${time_slot.start_time}-${time_slot.end_time}`}
    >
      <div className="font-bold truncate">{course.name}</div>
      <div className="text-xs opacity-75 truncate">{course_offering.course_type}</div>
      <div className="flex items-center gap-1 mt-1">
        <MapPin className="w-3 h-3" />
        <span className="truncate">{course_offering.location}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{time_slot.start_time}-{time_slot.end_time}</span>
      </div>
    </div>
  )
}

interface ScheduleGridProps {
  schedule: ScheduleWithDetails | null
}

function ScheduleGrid({ schedule }: ScheduleGridProps) {
  // Create a grid to track occupied slots
  const grid = Array(DAYS_OF_WEEK.length).fill(null).map(() => Array(TIME_SLOTS.length).fill(null))
  
  // Helper function to get time slot index
  const getTimeSlotIndex = (time: string) => {
    return TIME_SLOTS.findIndex(slot => slot.time === time)
  }
  
  // Helper function to calculate column span based on duration
  const getColumnSpan = (startTime: string, endTime: string) => {
    const startIndex = getTimeSlotIndex(startTime)
    const endIndex = getTimeSlotIndex(endTime)
    return Math.max(1, endIndex - startIndex + 1)
  }
  
  // Populate grid with scheduled courses
  schedule?.scheduled_courses.forEach(scheduledCourse => {
    const dayIndex = DAYS_OF_WEEK.indexOf(scheduledCourse.time_slot.day_of_week)
    const timeIndex = getTimeSlotIndex(scheduledCourse.time_slot.start_time)
    const colSpan = getColumnSpan(scheduledCourse.time_slot.start_time, scheduledCourse.time_slot.end_time)
    
    if (dayIndex >= 0 && timeIndex >= 0) {
      grid[dayIndex][timeIndex] = { scheduledCourse, colSpan }
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with time slots */}
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="text-sm font-medium text-gray-500 p-2">Time</div>
          {TIME_SLOTS.map((slot, index) => (
            <div key={index} className="text-xs text-center font-medium text-gray-500 p-1">
              {slot.label}
            </div>
          ))}
        </div>
        
        {/* Schedule grid - Fixed layout */}
        <div className="space-y-2">
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <div key={day} className="grid grid-cols-8 gap-2">
              {/* Day label */}
              <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded-md flex items-center justify-center">
                {day}
              </div>
              
              {/* Time slots for this day */}
              {TIME_SLOTS.map((timeSlot, timeIndex) => {
                const block = grid[dayIndex][timeIndex]
                
                return (
                  <div
                    key={`${day}-${timeIndex}`}
                    className={cn(
                      'min-h-[80px] p-1 border border-gray-200 rounded-md',
                      'hover:bg-gray-50 transition-colors',
                      block ? 'bg-transparent' : 'bg-white'
                    )}
                  >
                    {block && (
                      <ScheduleBlock
                        scheduledCourse={block.scheduledCourse}
                        colSpan={block.colSpan}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScheduleBuilder() {
  const session = useLHSession() as any
  const org = useOrg() as any
  const access_token = session?.data?.tokens?.access_token
  const userId = session?.data?.user?.id

  const { data: schedule, error, isLoading, mutate } = useSWR(
    userId && access_token ? [`/schedules/${userId}`, access_token] : null,
    ([url, token]) => getUserSchedule(userId, token)
  )

  const handleToggleLock = async () => {
    if (!schedule || !access_token) return
    
    try {
      const updatedSchedule = await toggleScheduleLock(userId, access_token)
      toast.success(updatedSchedule.is_locked ? 'Schedule locked' : 'Schedule unlocked')
      mutate()
    } catch (error) {
      toast.error('Failed to update schedule lock status')
    }
  }

  if (isLoading) {
    return (
      <div className="ml-10 mr-10 mx-auto bg-white rounded-xl nice-shadow px-4 py-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading schedule...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ml-10 mr-10 mx-auto bg-white rounded-xl nice-shadow px-4 py-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading schedule: {error.message}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-10 mr-10 mx-auto bg-white rounded-xl nice-shadow px-4 py-4">
      {/* Header */}
      <div className="flex flex-col bg-gray-50 -space-y-1 px-5 py-3 rounded-md mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Builder
            </h1>
            <h2 className="text-gray-500 text-md">Manage your weekly course schedule</h2>
          </div>
          
          {schedule && (
            <div className="flex items-center gap-3">
              <Badge 
                variant={schedule.is_locked ? "destructive" : "secondary"}
                className="flex items-center gap-1"
              >
                {schedule.is_locked ? (
                  <>
                    <Lock className="w-3 h-3" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    Unlocked
                  </>
                )}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleLock}
                className="flex items-center gap-2"
              >
                {schedule.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {schedule.is_locked ? 'Unlock' : 'Lock'} Schedule
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="mb-6">
        <ScheduleGrid schedule={schedule} />
      </div>

      {/* Course Legend */}
      <div className="bg-gray-50 rounded-md p-4">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Course Type Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(COURSE_TYPE_COLORS).map(([type, colorClass]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={cn('w-4 h-4 rounded border-2', colorClass)} />
              <span className="text-sm text-gray-700">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Summary */}
      {schedule && schedule.scheduled_courses.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-md p-4">
          <h3 className="font-medium text-gray-800 mb-3">Schedule Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.scheduled_courses.map((scheduledCourse) => {
              const { course, course_offering, time_slot } = scheduledCourse
              return (
                <div key={scheduledCourse.id} className="bg-white rounded-md p-3 border border-gray-200">
                  <div className="font-medium text-gray-800">{course.name}</div>
                  <div className="text-sm text-gray-600">{course_offering.course_type}</div>
                  <div className="text-sm text-gray-500">
                    {time_slot.day_of_week} {time_slot.start_time}-{time_slot.end_time}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {course_offering.location}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {schedule && schedule.scheduled_courses.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses scheduled</h3>
          <p className="text-gray-500 mb-4">Start building your schedule by adding courses to available time slots.</p>
          <Button variant="outline">
            Add Course
          </Button>
        </div>
      )}
    </div>
  )
}

export default ScheduleBuilder
