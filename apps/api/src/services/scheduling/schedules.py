from typing import List, Optional
from fastapi import HTTPException, Request, status
from sqlmodel import Session, select, and_
from datetime import datetime
from src.db.scheduling import (
    Schedule,
    ScheduleCreate,
    ScheduleRead,
    ScheduleWithDetails,
    ScheduledCourse,
    ScheduledCourseCreate,
    ScheduledCourseWithDetails,
    TimeSlot,
    CourseOffering,
    CourseOfferingRead,
    TimeSlotRead,
    DayOfWeekEnum,
)
from src.db.users import PublicUser, AnonymousUser
from src.db.courses.courses import Course, CourseRead
from src.security.rbac.rbac import (
    authorization_verify_if_user_is_anon,
    authorization_verify_based_on_org_admin_status,
)


async def create_user_schedule(
    request: Request,
    user_id: int,
    current_user: PublicUser | AnonymousUser,
    db_session: Session,
) -> ScheduleRead:
    """
    Create a schedule for a user if it doesn't exist.
    Only the user themselves or admins/maintainers can create schedules.
    """
    # Check if user is not anonymous
    await authorization_verify_if_user_is_anon(current_user.id)
    
    # Check if user is accessing their own schedule or has admin/maintainer role
    if current_user.id != user_id:
        # Check if user has admin/maintainer role in the organization
        is_admin_or_maintainer = await authorization_verify_based_on_org_admin_status(
            request, current_user.id, "update", "schedule_x", db_session
        )
        if not is_admin_or_maintainer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create your own schedule"
            )
    
    # Check if schedule already exists
    statement = select(Schedule).where(Schedule.user_id == user_id)
    existing_schedule = db_session.exec(statement).first()
    
    if existing_schedule:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Schedule already exists for this user"
        )
    
    # Create new schedule
    schedule_data = ScheduleCreate(
        user_id=user_id,
        is_locked=False
    )
    
    schedule = Schedule(**schedule_data.model_dump())
    schedule.creation_date = str(datetime.now())
    schedule.update_date = str(datetime.now())
    
    db_session.add(schedule)
    db_session.commit()
    db_session.refresh(schedule)
    
    return ScheduleRead.model_validate(schedule)


async def get_user_schedule(
    request: Request,
    user_id: int,
    current_user: PublicUser | AnonymousUser,
    db_session: Session,
) -> ScheduleWithDetails:
    """
    Get a user's schedule with all scheduled courses and their details.
    Only the user themselves or admins/maintainers can access schedules.
    Automatically creates a schedule if one doesn't exist.
    """
    # Check if user is not anonymous
    await authorization_verify_if_user_is_anon(current_user.id)
    
    # Check if user is accessing their own schedule or has admin/maintainer role
    if current_user.id != user_id:
        # Check if user has admin/maintainer role in the organization
        is_admin_or_maintainer = await authorization_verify_based_on_org_admin_status(
            request, current_user.id, "read", "schedule_x", db_session
        )
        if not is_admin_or_maintainer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own schedule"
            )
    
    # Get user's schedule
    statement = select(Schedule).where(Schedule.user_id == user_id)
    schedule = db_session.exec(statement).first()
    
    # If no schedule exists, create one automatically
    if not schedule:
        schedule_data = ScheduleCreate(
            user_id=user_id,
            is_locked=False
        )
        
        schedule = Schedule(**schedule_data.model_dump())
        schedule.creation_date = str(datetime.now())
        schedule.update_date = str(datetime.now())
        
        db_session.add(schedule)
        db_session.commit()
        db_session.refresh(schedule)
    
    # Get scheduled courses with their details
    scheduled_courses_with_details = await _get_scheduled_courses_with_details(
        schedule.id, db_session
    )
    
    # Create enhanced schedule response
    schedule_with_details = ScheduleWithDetails(
        **schedule.model_dump(),
        scheduled_courses=scheduled_courses_with_details
    )
    
    return schedule_with_details


async def add_course_to_schedule(
    request: Request,
    user_id: int,
    course_offering_id: int,
    time_slot_id: int,
    org_id: int,
    current_user: PublicUser | AnonymousUser,
    db_session: Session,
) -> ScheduleWithDetails:
    """
    Add a course to a user's schedule.
    Validates schedule is not locked and no time conflicts exist.
    """
    # Check if user is not anonymous
    await authorization_verify_if_user_is_anon(current_user.id)
    
    # Check if user is accessing their own schedule or has admin/maintainer role
    if current_user.id != user_id:
        # Check if user has admin/maintainer role in the organization
        is_admin_or_maintainer = await authorization_verify_based_on_org_admin_status(
            request, current_user.id, "update", "schedule_x", db_session
        )
        if not is_admin_or_maintainer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only modify your own schedule"
            )
    
    # Get user's schedule
    statement = select(Schedule).where(Schedule.user_id == user_id)
    schedule = db_session.exec(statement).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found for this user"
        )
    
    # Check if schedule is locked
    if schedule.is_locked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Schedule is locked and cannot be modified"
        )
    
    # Validate that the time slot belongs to the course offering
    statement = select(TimeSlot).where(
        and_(
            TimeSlot.id == time_slot_id,
            TimeSlot.course_offering_id == course_offering_id,
            TimeSlot.org_id == org_id
        )
    )
    time_slot = db_session.exec(statement).first()
    
    if not time_slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time slot for the specified course offering"
        )
    
    # Check for time conflicts
    await _check_time_conflicts(schedule.id, time_slot, db_session)
    
    # Create scheduled course
    scheduled_course_data = ScheduledCourseCreate(
        schedule_id=schedule.id,
        timeslot_id=time_slot_id,
        org_id=org_id
    )
    
    scheduled_course = ScheduledCourse(**scheduled_course_data.model_dump())
    scheduled_course.creation_date = str(datetime.now())
    scheduled_course.update_date = str(datetime.now())
    
    db_session.add(scheduled_course)
    db_session.commit()
    db_session.refresh(scheduled_course)
    
    # Update schedule timestamp
    schedule.update_date = str(datetime.now())
    db_session.add(schedule)
    db_session.commit()
    db_session.refresh(schedule)
    
    # Get scheduled courses with their details
    scheduled_courses_with_details = await _get_scheduled_courses_with_details(
        schedule.id, db_session
    )
    
    # Create enhanced schedule response
    schedule_with_details = ScheduleWithDetails(
        **schedule.model_dump(),
        scheduled_courses=scheduled_courses_with_details
    )
    
    return schedule_with_details


async def remove_course_from_schedule(
    request: Request,
    user_id: int,
    scheduled_course_id: int,
    current_user: PublicUser | AnonymousUser,
    db_session: Session,
) -> ScheduleWithDetails:
    """
    Remove a course from a user's schedule.
    Validates schedule is not locked and scheduled course belongs to user.
    """
    # Check if user is not anonymous
    await authorization_verify_if_user_is_anon(current_user.id)
    
    # Check if user is accessing their own schedule or has admin/maintainer role
    if current_user.id != user_id:
        # Check if user has admin/maintainer role in the organization
        is_admin_or_maintainer = await authorization_verify_based_on_org_admin_status(
            request, current_user.id, "update", "schedule_x", db_session
        )
        if not is_admin_or_maintainer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only modify your own schedule"
            )
    
    # Get user's schedule
    statement = select(Schedule).where(Schedule.user_id == user_id)
    schedule = db_session.exec(statement).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found for this user"
        )
    
    # Check if schedule is locked
    if schedule.is_locked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Schedule is locked and cannot be modified"
        )
    
    # Get the scheduled course and verify it belongs to this user's schedule
    statement = select(ScheduledCourse).where(
        and_(
            ScheduledCourse.id == scheduled_course_id,
            ScheduledCourse.schedule_id == schedule.id
        )
    )
    scheduled_course = db_session.exec(statement).first()
    
    if not scheduled_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled course not found or does not belong to this user's schedule"
        )
    
    # Remove the scheduled course
    db_session.delete(scheduled_course)
    db_session.commit()
    
    # Update schedule timestamp
    schedule.update_date = str(datetime.now())
    db_session.add(schedule)
    db_session.commit()
    db_session.refresh(schedule)
    
    # Get scheduled courses with their details
    scheduled_courses_with_details = await _get_scheduled_courses_with_details(
        schedule.id, db_session
    )
    
    # Create enhanced schedule response
    schedule_with_details = ScheduleWithDetails(
        **schedule.model_dump(),
        scheduled_courses=scheduled_courses_with_details
    )
    
    return schedule_with_details


async def get_available_time_slots(
    request: Request,
    course_offering_id: int,
    user_id: int,
    current_user: PublicUser | AnonymousUser,
    db_session: Session,
) -> List[TimeSlotRead]:
    """
    Get available time slots for a course offering that don't conflict with user's current schedule.
    """
    # Check if user is not anonymous
    await authorization_verify_if_user_is_anon(current_user.id)
    
    # Check if user is accessing their own schedule or has admin/maintainer role
    if current_user.id != user_id:
        # Check if user has admin/maintainer role in the organization
        is_admin_or_maintainer = await authorization_verify_based_on_org_admin_status(
            request, current_user.id, "read", "schedule_x", db_session
        )
        if not is_admin_or_maintainer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own schedule information"
            )
    
    # Get all time slots for the course offering
    statement = select(TimeSlot).where(TimeSlot.course_offering_id == course_offering_id)
    all_time_slots = db_session.exec(statement).all()
    
    # Get user's schedule
    statement = select(Schedule).where(Schedule.user_id == user_id)
    schedule = db_session.exec(statement).first()
    
    available_slots = []
    
    for time_slot in all_time_slots:
        # Check if this time slot conflicts with user's current schedule
        has_conflict = await _has_time_conflict(schedule.id if schedule else None, time_slot, db_session)
        
        if not has_conflict:
            available_slots.append(TimeSlotRead.model_validate(time_slot))
    
    return available_slots


async def _get_scheduled_courses_with_details(
    schedule_id: int,
    db_session: Session,
) -> List[ScheduledCourseWithDetails]:
    """
    Get all scheduled courses for a schedule with their nested details.
    """
    # Get scheduled courses with their time slots, course offerings, and courses
    statement = (
        select(ScheduledCourse, TimeSlot, CourseOffering, Course)
        .join(TimeSlot, ScheduledCourse.timeslot_id == TimeSlot.id)
        .join(CourseOffering, TimeSlot.course_offering_id == CourseOffering.id)
        .join(Course, CourseOffering.course_id == Course.id)
        .where(ScheduledCourse.schedule_id == schedule_id)
        .order_by(TimeSlot.day_of_week, TimeSlot.start_time)
    )
    
    results = db_session.exec(statement).all()
    
    scheduled_courses_with_details = []
    for scheduled_course, time_slot, course_offering, course in results:
        scheduled_course_with_details = ScheduledCourseWithDetails(
            id=scheduled_course.id,
            schedule_id=scheduled_course.schedule_id,
            timeslot_id=scheduled_course.timeslot_id,
            org_id=scheduled_course.org_id,
            creation_date=scheduled_course.creation_date,
            update_date=scheduled_course.update_date,
            course_offering=CourseOfferingRead.model_validate(course_offering),
            time_slot=TimeSlotRead.model_validate(time_slot),
            course=CourseRead.model_validate(course)
        )
        scheduled_courses_with_details.append(scheduled_course_with_details)
    
    return scheduled_courses_with_details


async def _check_time_conflicts(
    schedule_id: int,
    new_time_slot: TimeSlot,
    db_session: Session,
) -> None:
    """
    Check if a new time slot conflicts with existing scheduled courses.
    Raises HTTPException if conflict is found.
    """
    # Get all scheduled courses for this schedule
    statement = (
        select(ScheduledCourse, TimeSlot)
        .join(TimeSlot, ScheduledCourse.timeslot_id == TimeSlot.id)
        .where(ScheduledCourse.schedule_id == schedule_id)
    )
    scheduled_courses = db_session.exec(statement).all()
    
    for scheduled_course, existing_time_slot in scheduled_courses:
        # Check if same day of week
        if existing_time_slot.day_of_week == new_time_slot.day_of_week:
            # Check if time ranges overlap
            if _time_ranges_overlap(
                existing_time_slot.start_time,
                existing_time_slot.end_time,
                new_time_slot.start_time,
                new_time_slot.end_time
            ):
                # Get course offering details for better error message
                statement = select(CourseOffering, Course).join(
                    Course, CourseOffering.course_id == Course.id
                ).where(CourseOffering.id == existing_time_slot.course_offering_id)
                result = db_session.exec(statement).first()
                
                if result:
                    course_offering, course = result
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Time conflict with existing course '{course.name}' ({course_offering.course_type}) on {existing_time_slot.day_of_week} {existing_time_slot.start_time}-{existing_time_slot.end_time}"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Time conflict on {existing_time_slot.day_of_week} {existing_time_slot.start_time}-{existing_time_slot.end_time}"
                    )


async def toggle_schedule_lock(
    request: Request,
    user_id: int,
    current_user: PublicUser | AnonymousUser,
    db_session: Session,
) -> ScheduleWithDetails:
    """
    Toggle the lock status of a user's schedule.
    Only the user themselves or admins/maintainers can toggle lock status.
    """
    # Check if user is not anonymous
    await authorization_verify_if_user_is_anon(current_user.id)
    
    # Check if user is accessing their own schedule or has admin/maintainer role
    if current_user.id != user_id:
        # Check if user has admin/maintainer role in the organization
        is_admin_or_maintainer = await authorization_verify_based_on_org_admin_status(
            request, current_user.id, "update", "schedule_x", db_session
        )
        if not is_admin_or_maintainer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only modify your own schedule"
            )
    
    # Get user's schedule
    statement = select(Schedule).where(Schedule.user_id == user_id)
    schedule = db_session.exec(statement).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found for this user"
        )
    
    # Toggle lock status
    schedule.is_locked = not schedule.is_locked
    schedule.update_date = str(datetime.now())
    
    db_session.add(schedule)
    db_session.commit()
    db_session.refresh(schedule)
    
    # Get scheduled courses with their details
    scheduled_courses_with_details = await _get_scheduled_courses_with_details(
        schedule.id, db_session
    )
    
    # Create enhanced schedule response
    schedule_with_details = ScheduleWithDetails(
        **schedule.model_dump(),
        scheduled_courses=scheduled_courses_with_details
    )
    
    return schedule_with_details


async def _has_time_conflict(
    schedule_id: Optional[int],
    time_slot: TimeSlot,
    db_session: Session,
) -> bool:
    """
    Check if a time slot conflicts with existing scheduled courses.
    Returns True if conflict exists, False otherwise.
    """
    if not schedule_id:
        return False
    
    # Get all scheduled courses for this schedule
    statement = (
        select(ScheduledCourse, TimeSlot)
        .join(TimeSlot, ScheduledCourse.timeslot_id == TimeSlot.id)
        .where(ScheduledCourse.schedule_id == schedule_id)
    )
    scheduled_courses = db_session.exec(statement).all()
    
    for scheduled_course, existing_time_slot in scheduled_courses:
        # Check if same day of week
        if existing_time_slot.day_of_week == time_slot.day_of_week:
            # Check if time ranges overlap
            if _time_ranges_overlap(
                existing_time_slot.start_time,
                existing_time_slot.end_time,
                time_slot.start_time,
                time_slot.end_time
            ):
                return True
    
    return False


def _time_ranges_overlap(
    start1: str,
    end1: str,
    start2: str,
    end2: str,
) -> bool:
    """
    Check if two time ranges overlap.
    Time format is "HH:MM" (e.g., "08:30").
    """
    # Convert time strings to minutes for easier comparison
    def time_to_minutes(time_str: str) -> int:
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes
    
    start1_min = time_to_minutes(start1)
    end1_min = time_to_minutes(end1)
    start2_min = time_to_minutes(start2)
    end2_min = time_to_minutes(end2)
    
    # Check if ranges overlap
    return start1_min < end2_min and start2_min < end1_min
