'use client'
import React from 'react'
import { Clock, MapPin, GripVertical } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AvailableCourseOffering } from '@services/scheduling/schedules'
// import { Badge } from '@components/ui/badge'
import { cn } from '@/lib/utils'

// Course type colors (same as in ScheduleBuilder)
const COURSE_TYPE_COLORS = {
  'Lecture': 'bg-blue-100 border-blue-300 text-blue-800',
  'Section': 'bg-green-100 border-green-300 text-green-800',
  'Lab': 'bg-purple-100 border-purple-300 text-purple-800',
  'Tutorial': 'bg-orange-100 border-orange-300 text-orange-800',
  'Seminar': 'bg-pink-100 border-pink-300 text-pink-800',
}

interface DraggableCourseCardProps {
  courseOffering: AvailableCourseOffering
}

function DraggableCourseCard({ courseOffering }: DraggableCourseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `course-offering-${courseOffering.id}`,
    data: {
      type: 'course-offering',
      courseOffering,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const colorClass = COURSE_TYPE_COLORS[courseOffering.course_type] || 'bg-gray-100 border-gray-300 text-gray-800'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all',
        'hover:shadow-md hover:scale-105',
        colorClass,
        isDragging && 'opacity-50 shadow-lg scale-105'
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">
            {courseOffering.course.name}
          </div>
          <div className="text-xs opacity-75 mb-2">
            {courseOffering.course_type} • {courseOffering.lecturer_name}
          </div>
          
          <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{courseOffering.location}</span>
          </div>
          
          <div className="space-y-1">
            {courseOffering.time_slots.map((timeSlot) => (
              <div key={timeSlot.id} className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" />
                <span>
                  {timeSlot.day_of_week} {timeSlot.start_time}-{timeSlot.end_time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CoursesSidebarProps {
  availableCourses: AvailableCourseOffering[]
  isLoading?: boolean
}

export default function CoursesSidebar({ availableCourses, isLoading }: CoursesSidebarProps) {
  if (isLoading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <h2 className="font-bold text-lg text-gray-800 mb-4">Available Courses</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4">
      <div className="mb-4">
        <h2 className="font-bold text-lg text-gray-800 mb-2">Available Courses</h2>
        <p className="text-sm text-gray-600">
          Drag courses to add them to your schedule
        </p>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {availableCourses.length > 0 ? (
          availableCourses.map((courseOffering) => (
            <DraggableCourseCard
              key={courseOffering.id}
              courseOffering={courseOffering}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No available courses</div>
            <div className="text-sm text-gray-500">
              All courses have been scheduled or none are available.
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(COURSE_TYPE_COLORS).map(([type, colorClass]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={cn('w-3 h-3 rounded border', colorClass)} />
              <span className="text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}