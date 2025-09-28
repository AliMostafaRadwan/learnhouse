import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
} from '@services/utils/ts/requests'
import { CourseOffering, Course, TimeSlot } from './schedules'

// Extended course offering with course details for display
export interface CourseOfferingWithDetails extends CourseOffering {
  course: Course
  time_slots: TimeSlot[]
}

// For now, let's create a mock function that simulates getting available course offerings
// This would typically come from an API endpoint like /api/v1/courses/org/{org_id}/offerings
export async function getAvailableCourseOfferings(
  orgId: number,
  access_token: string
): Promise<CourseOfferingWithDetails[]> {
  try {
    // In a real implementation, this would be an API call like:
    // const result = await fetch(
    //   `${getAPIUrl()}courses/org/${orgId}/offerings`,
    //   RequestBodyWithAuthHeader('GET', null, null, access_token)
    // )
    // const res = await errorHandling(result)
    // return res.data

    // For now, return mock data that represents available course offerings
    return [
      {
        id: 1,
        course_type: 'Lecture',
        lecturer_name: 'Dr. Smith',
        location: 'Room A-101',
        course_id: 1,
        org_id: orgId,
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        course: {
          id: 1,
          name: 'Introduction to Computer Science',
          description: 'Basic concepts of computer science',
          public: true,
          open_to_contributors: false,
          org_id: orgId,
          course_uuid: 'cs101-uuid',
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
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
            update_date: new Date().toISOString(),
          },
          {
            id: 2,
            day_of_week: 'Wednesday',
            start_time: '9:25',
            end_time: '10:20',
            course_offering_id: 1,
            org_id: orgId,
            creation_date: new Date().toISOString(),
            update_date: new Date().toISOString(),
          },
        ],
      },
      {
        id: 2,
        course_type: 'Lab',
        lecturer_name: 'Prof. Johnson',
        location: 'Computer Lab B',
        course_id: 2,
        org_id: orgId,
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        course: {
          id: 2,
          name: 'Data Structures and Algorithms',
          description: 'Fundamental data structures and algorithms',
          public: true,
          open_to_contributors: false,
          org_id: orgId,
          course_uuid: 'cs201-uuid',
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
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
            update_date: new Date().toISOString(),
          },
        ],
      },
      {
        id: 3,
        course_type: 'Lecture',
        lecturer_name: 'Dr. Williams',
        location: 'Lecture Hall C',
        course_id: 3,
        org_id: orgId,
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        course: {
          id: 3,
          name: 'Calculus I',
          description: 'Introduction to differential and integral calculus',
          public: true,
          open_to_contributors: false,
          org_id: orgId,
          course_uuid: 'math101-uuid',
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
        },
        time_slots: [
          {
            id: 4,
            day_of_week: 'Monday',
            start_time: '11:15',
            end_time: '12:10',
            course_offering_id: 3,
            org_id: orgId,
            creation_date: new Date().toISOString(),
            update_date: new Date().toISOString(),
          },
          {
            id: 5,
            day_of_week: 'Friday',
            start_time: '11:15',
            end_time: '12:10',
            course_offering_id: 3,
            org_id: orgId,
            creation_date: new Date().toISOString(),
            update_date: new Date().toISOString(),
          },
        ],
      },
      {
        id: 4,
        course_type: 'Tutorial',
        lecturer_name: 'TA Davis',
        location: 'Room D-205',
        course_id: 4,
        org_id: orgId,
        creation_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        course: {
          id: 4,
          name: 'Physics I',
          description: 'Mechanics and thermodynamics',
          public: true,
          open_to_contributors: false,
          org_id: orgId,
          course_uuid: 'phys101-uuid',
          creation_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
        },
        time_slots: [
          {
            id: 6,
            day_of_week: 'Thursday',
            start_time: '13:05',
            end_time: '14:00',
            course_offering_id: 4,
            org_id: orgId,
            creation_date: new Date().toISOString(),
            update_date: new Date().toISOString(),
          },
        ],
      },
    ]
  } catch (error) {
    console.error('Error fetching available course offerings:', error)
    return []
  }
}

// Helper function to filter out course offerings that are already scheduled
export function filterUnscheduledCourseOfferings(
  allCourseOfferings: CourseOfferingWithDetails[],
  scheduledCourseIds: number[]
): CourseOfferingWithDetails[] {
  return allCourseOfferings.filter(
    offering => !scheduledCourseIds.includes(offering.id)
  )
}

// Function to get available time slots for a specific course offering
export async function getCourseOfferingAvailableSlots(
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