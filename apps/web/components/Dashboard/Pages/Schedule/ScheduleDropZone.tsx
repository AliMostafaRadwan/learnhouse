'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleDropZoneProps {
  day: string
  timeSlot: string
  isOccupied: boolean
  onDrop: (day: string, timeSlot: string, data: any) => void
  className?: string
  children?: React.ReactNode
}

export default function ScheduleDropZone({ 
  day, 
  timeSlot, 
  isOccupied, 
  onDrop, 
  className,
  children
}: ScheduleDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = isOccupied ? 'none' : 'copy'
    if (!isOccupied) {
      setIsDragOver(true)
    }
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (isOccupied) return
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      onDrop(day, timeSlot, data)
    } catch (error) {
      console.error('Failed to parse drop data:', error)
    }
  }
  
  return (
    <div
      className={cn(
        'min-h-[80px] p-1 border border-gray-200 rounded-md transition-colors relative',
        'hover:bg-gray-50',
        isOccupied ? 'bg-transparent' : 'bg-white',
        isDragOver && !isOccupied && 'bg-blue-50 border-blue-300 border-2',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!isOccupied && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity',
          isDragOver ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium">
            <Plus className="w-3 h-3" />
            Drop course here
          </div>
        </div>
      )}
      {children}
    </div>
  )
}