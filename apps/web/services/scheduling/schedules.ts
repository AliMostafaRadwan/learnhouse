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

export async function getAllCourseOfferings(
  orgId: number,
  access_token: string
): Promise<CourseOffering[]> {
  const result = await fetch(
    `${getAPIUrl()}course-offerings?org_id=${orgId}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res.data
}

export async function getAllTimeSlots(
  orgId: number,
  access_token: string
): Promise<TimeSlot[]> {
  const result = await fetch(
    `${getAPIUrl()}time-slots?org_id=${orgId}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res.data
}