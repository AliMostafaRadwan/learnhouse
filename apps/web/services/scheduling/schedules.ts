import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
  getResponseMetadata,
} from '@services/utils/ts/requests'

// Types for the scheduling API
export interface TimeSlot {
  id: number
  day_of_week: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  start_time: string
  end_time: string
  course_offering_id: number
  org_id: number
  creation_date: string
  update_date: string
}

export interface CourseOffering {
  id: number
  course_type: 'Lecture' | 'Section' | 'Lab' | 'Tutorial' | 'Seminar'
  lecturer_name: string
  location: string
  course_id: number
  org_id: number
  creation_date: string
  update_date: string
}

export interface Course {
  id: number
  name: string
  description?: string
  about?: string
  learnings?: string
  tags?: string
  thumbnail_type?: string
  thumbnail_image?: string
  thumbnail_video?: string
  public: boolean
  open_to_contributors: boolean
  org_id: number
  course_uuid: string
  creation_date: string
  update_date: string
}

export interface ScheduledCourseWithDetails {
  id: number
  schedule_id: number
  timeslot_id: number
  org_id: number
  creation_date: string
  update_date: string
  course_offering: CourseOffering
  time_slot: TimeSlot
  course: Course
}

export interface ScheduleWithDetails {
  id: number
  user_id: number
  is_locked: boolean
  creation_date: string
  update_date: string
  scheduled_courses: ScheduledCourseWithDetails[]
}

export interface AddCourseToScheduleRequest {
  course_offering_id: number
  time_slot_id: number
  org_id: number
}

// API functions
export async function getUserSchedule(
  userId: number,
  access_token: string
): Promise<ScheduleWithDetails> {
  const result = await fetch(
    `${getAPIUrl()}schedules/${userId}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res.data
}

export async function addCourseToSchedule(
  userId: number,
  courseData: AddCourseToScheduleRequest,
  access_token: string
): Promise<ScheduleWithDetails> {
  const result = await fetch(
    `${getAPIUrl()}schedules/${userId}`,
    RequestBodyWithAuthHeader('POST', courseData, null, access_token)
  )
  const res = await errorHandling(result)
  return res.data
}

export async function removeCourseFromSchedule(
  userId: number,
  scheduledCourseId: number,
  access_token: string
): Promise<ScheduleWithDetails> {
  const result = await fetch(
    `${getAPIUrl()}schedules/${userId}/courses/${scheduledCourseId}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res.data
}

export async function getAvailableTimeSlots(
  courseOfferingId: number,
  userId: number,
  access_token: string
): Promise<TimeSlot[]> {
  const result = await fetch(
    `${getAPIUrl()}courses/${courseOfferingId}/available-slots?user_id=${userId}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res.data
}

export async function toggleScheduleLock(
  userId: number,
  access_token: string
): Promise<ScheduleWithDetails> {
  const result = await fetch(
    `${getAPIUrl()}schedules/${userId}/lock`,
    RequestBodyWithAuthHeader('PATCH', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res.data
}

// Types for available courses in sidebar
export interface AvailableCourseOffering {
  id: number
  course_type: 'Lecture' | 'Section' | 'Lab' | 'Tutorial' | 'Seminar'
  lecturer_name: string
  location: string
  course: Course
  time_slots: TimeSlot[]
}

// For now, we'll use mock data until the API endpoint is available
export async function getAvailableCourseOfferings(
  orgId: number,
  access_token: string
): Promise<AvailableCourseOffering[]> {
  // TODO: Replace with actual API call once endpoint is available
  // This should call something like: GET /api/v1/course-offerings?org_id=${orgId}&available=true
  
  // Mock data for demonstration
  return [
    {
      id: 1,
      course_type: 'Lecture',
      lecturer_name: 'Dr. Smith',
      location: 'Room 101',
      course: {
        id: 1,
        name: 'Introduction to Computer Science',
        description: 'Basic CS concepts',
        public: true,
        open_to_contributors: false,
        org_id: orgId,
        course_uuid: 'cs101-uuid',
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString()
      },
      time_slots: [
        {
          id: 1,
          day_of_week: 'Monday',
          start_time: '9:25',
          end_time: '10:20',
          course_offering_id: 1,
          org_id: orgId,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString()
        },
        {
          id: 2,
          day_of_week: 'Wednesday',
          start_time: '9:25',
          end_time: '10:20',
          course_offering_id: 1,
          org_id: orgId,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString()
        }
      ]
    },
    {
      id: 2,
      course_type: 'Lab',
      lecturer_name: 'Prof. Johnson',
      location: 'Lab 204',
      course: {
        id: 2,
        name: 'Data Structures',
        description: 'Advanced data structures',
        public: true,
        open_to_contributors: false,
        org_id: orgId,
        course_uuid: 'ds201-uuid',
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString()
      },
      time_slots: [
        {
          id: 3,
          day_of_week: 'Tuesday',
          start_time: '14:00',
          end_time: '15:50',
          course_offering_id: 2,
          org_id: orgId,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString()
        }
      ]
    },
    {
      id: 3,
      course_type: 'Seminar',
      lecturer_name: 'Dr. Williams',
      location: 'Conference Room A',
      course: {
        id: 3,
        name: 'Machine Learning Ethics',
        description: 'Ethical considerations in ML',
        public: true,
        open_to_contributors: false,
        org_id: orgId,
        course_uuid: 'ml-ethics-uuid',
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString()
      },
      time_slots: [
        {
          id: 4,
          day_of_week: 'Friday',
          start_time: '13:05',
          end_time: '14:00',
          course_offering_id: 3,
          org_id: orgId,
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString()
        }
      ]
    }
  ]
}