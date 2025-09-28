from typing import List, Optional
from pydantic import BaseModel
from src.db.scheduling import ScheduleRead, TimeSlotRead, CourseOfferingRead
from src.db.courses.courses import CourseRead


class ScheduledCourseWithDetails(BaseModel):
    """Enhanced scheduled course model with nested details"""
    id: int
    schedule_id: int
    timeslot_id: int
    org_id: int
    creation_date: str
    update_date: str
    
    # Nested details
    course_offering: CourseOfferingRead
    time_slot: TimeSlotRead
    course: CourseRead


class ScheduleWithDetails(ScheduleRead):
    """Enhanced schedule model with scheduled courses and their details"""
    scheduled_courses: List[ScheduledCourseWithDetails] = []
