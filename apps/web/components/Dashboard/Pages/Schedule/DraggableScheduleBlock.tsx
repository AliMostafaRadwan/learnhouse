'use client'
import React from 'react'
import { Clock, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduledCourseWithDetails } from '@services/scheduling/schedules'

// Course type colors (same as ScheduleBuilder)
const COURSE_TYPE_COLORS = {
  'Lecture': 'bg-blue-100 border-blue-300 text-blue-800',
  'Section': 'bg-green-100 border-green-300 text-green-800',
  'Lab': 'bg-purple-100 border-purple-300 text-purple-800',
  'Tutorial': 'bg-orange-100 border-orange-300 text-orange-800',
  'Seminar': 'bg-pink-100 border-pink-300 text-pink-800',
}

interface DraggableScheduleBlockProps {
  scheduledCourse: ScheduledCourseWithDetails
  colSpan: number
  onRemove?: (scheduledCourseId: number) => void
  isDragging?: boolean
}

export default function DraggableScheduleBlock({ 
  scheduledCourse, 
  colSpan, 
  onRemove,
  isDragging = false 
}: DraggableScheduleBlockProps) {
  const { course, course_offering, time_slot } = scheduledCourse
  const colorClass = COURSE_TYPE_COLORS[course_offering.course_type] || 'bg-gray-100 border-gray-300 text-gray-800'
  
  return (
    <div
      className={cn(
        'p-2 rounded-md border-2 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing relative group',
        colorClass,
        isDragging && 'opacity-50'
      )}
      style={{ gridColumn: `span ${colSpan}` }}
      title={`${course.name} - ${course_offering.course_type} - ${time_slot.start_time}-${time_slot.end_time}`}
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: 'scheduled-course',
          scheduledCourse: scheduledCourse
        }))
        e.dataTransfer.effectAllowed = 'move'
      }}
    >
      {/* Remove button */}
      {onRemove && (
        <button
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            onRemove(scheduledCourse.id)
          }}
          title="Remove course from schedule"
        >
          <X className="w-2 h-2" />
        </button>
      )}
      
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