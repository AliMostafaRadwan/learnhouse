'use client'
import React from 'react'
import { BookOpen, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AvailableCourseOffering } from '@services/scheduling/schedules'

// Course type colors (same as ScheduleBuilder)
const COURSE_TYPE_COLORS = {
  'Lecture': 'bg-blue-100 border-blue-300 text-blue-800',
  'Section': 'bg-green-100 border-green-300 text-green-800',
  'Lab': 'bg-purple-100 border-purple-300 text-purple-800',
  'Tutorial': 'bg-orange-100 border-orange-300 text-orange-800',
  'Seminar': 'bg-pink-100 border-pink-300 text-pink-800',
}

interface CourseSidebarProps {
  availableCourses: AvailableCourseOffering[]
  isLoading?: boolean
}

interface DraggableCourseItemProps {
  courseOffering: AvailableCourseOffering
}

function DraggableCourseItem({ courseOffering }: DraggableCourseItemProps) {
  const { course_offering, course, available_time_slots } = courseOffering
  const colorClass = COURSE_TYPE_COLORS[course_offering.course_type] || 'bg-gray-100 border-gray-300 text-gray-800'
  
  return (
    <div
      className={cn(
        'p-3 rounded-md border-2 text-sm font-medium shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing',
        colorClass,
        'mb-2'
      )}
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: 'course-offering',
          courseOffering: courseOffering
        }))
        e.dataTransfer.effectAllowed = 'copy'
      }}
    >
      <div className="font-bold truncate mb-1">{course.name}</div>
      <div className="text-xs opacity-75 truncate mb-2">{course_offering.course_type}</div>
      
      <div className="flex items-center gap-1 mb-1">
        <MapPin className="w-3 h-3" />
        <span className="text-xs truncate">{course_offering.location}</span>
      </div>
      
      <div className="flex items-center gap-1 mb-2">
        <Clock className="w-3 h-3" />
        <span className="text-xs">
          {available_time_slots.length} time slot{available_time_slots.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="text-xs opacity-60">
        Lecturer: {course_offering.lecturer_name}
      </div>
    </div>
  )
}

export default function CourseSidebar({ availableCourses, isLoading }: CourseSidebarProps) {
  if (isLoading) {
    return (
      <div className="w-80 bg-white rounded-xl nice-shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Available Courses</h3>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-md border-2 bg-gray-100 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white rounded-xl nice-shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Available Courses</h3>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Drag courses to the schedule grid to add them to your schedule.
      </div>
      
      {availableCourses.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No courses available</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableCourses.map((courseOffering) => (
            <DraggableCourseItem
              key={`${courseOffering.course_offering.id}-${courseOffering.course.id}`}
              courseOffering={courseOffering}
            />
          ))}
        </div>
      )}
      
      {/* Course Type Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Course Types</h4>
        <div className="space-y-1">
          {Object.entries(COURSE_TYPE_COLORS).map(([type, colorClass]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded border', colorClass)} />
              <span className="text-xs text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}