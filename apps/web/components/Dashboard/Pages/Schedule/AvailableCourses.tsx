'use client'
import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { BookOpen, Clock, MapPin, User } from 'lucide-react'
import { CourseOfferingWithDetails } from '@services/scheduling/course-offerings'
import { cn } from '@/lib/utils'

// Course type colors (matching ScheduleBuilder)
const COURSE_TYPE_COLORS = {
  'Lecture': 'bg-blue-100 border-blue-300 text-blue-800',
  'Section': 'bg-green-100 border-green-300 text-green-800',
  'Lab': 'bg-purple-100 border-purple-300 text-purple-800',
  'Tutorial': 'bg-orange-100 border-orange-300 text-orange-800',
  'Seminar': 'bg-pink-100 border-pink-300 text-pink-800',
}

interface DraggableCourseCardProps {
  courseOffering: CourseOfferingWithDetails
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

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const colorClass = COURSE_TYPE_COLORS[courseOffering.course_type] || 'bg-gray-100 border-gray-300 text-gray-800'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-all duration-200',
        'touch-none select-none', // Prevent text selection during drag
        colorClass,
        isDragging && 'opacity-50 shadow-lg scale-105 z-50'
      )}
    >
      <div className="space-y-2">
        {/* Course name */}
        <div className="font-semibold text-sm truncate">
          {courseOffering.course.name}
        </div>
        
        {/* Course type */}
        <div className="text-xs font-medium opacity-75">
          {courseOffering.course_type}
        </div>
        
        {/* Lecturer */}
        <div className="flex items-center gap-1 text-xs">
          <User className="w-3 h-3" />
          <span className="truncate">{courseOffering.lecturer_name}</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-xs">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{courseOffering.location}</span>
        </div>
        
        {/* Available time slots */}
        <div className="space-y-1">
          <div className="text-xs font-medium opacity-75">Available Times:</div>
          {courseOffering.time_slots.map((timeSlot, index) => (
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
  )
}

interface AvailableCoursesProps {
  courseOfferings: CourseOfferingWithDetails[]
  isLoading?: boolean
}

export default function AvailableCourses({ courseOfferings, isLoading }: AvailableCoursesProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 h-fit">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Available Courses
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-fit">
      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Available Courses
      </h3>
      
      {courseOfferings.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No available courses</p>
          <p className="text-gray-400 text-xs mt-1">
            All courses are already scheduled
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-600">
            Drag courses below to add them to your schedule
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {courseOfferings.map((courseOffering) => (
              <DraggableCourseCard
                key={courseOffering.id}
                courseOffering={courseOffering}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}