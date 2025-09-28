from typing import List
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlmodel import Session
from pydantic import BaseModel
from src.core.events.database import get_db_session
from src.db.scheduling import ScheduleWithDetails, TimeSlotRead
from src.db.users import PublicUser
from src.security.auth import get_current_user
from src.services.scheduling.schedules import (
    create_user_schedule,
    get_user_schedule,
    add_course_to_schedule,
    remove_course_from_schedule,
    get_available_time_slots,
    toggle_schedule_lock,
)

router = APIRouter()


class AddCourseToScheduleRequest(BaseModel):
    course_offering_id: int
    time_slot_id: int
    org_id: int


@router.get("/{user_id}", response_model=ScheduleWithDetails)
async def api_get_user_schedule(
    request: Request,
    user_id: int,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> ScheduleWithDetails:
    """
    Get the complete schedule for a given user.
    
    The response includes:
    - Schedule details (is_locked status)
    - List of scheduled courses with nested course offering and time slot details
    
    SECURITY:
    - Only the user themselves or users with admin/maintainer roles can access it
    """
    return await get_user_schedule(request, user_id, current_user, db_session)


@router.post("/{user_id}", response_model=ScheduleWithDetails)
async def api_add_course_to_schedule(
    request: Request,
    user_id: int,
    course_data: AddCourseToScheduleRequest,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> ScheduleWithDetails:
    """
    Assign a course to a student's schedule.
    
    The request body should contain:
    - course_offering_id: ID of the course offering
    - time_slot_id: ID of the chosen time slot
    - org_id: Organization ID for scoping
    
    VALIDATION:
    - Schedule must not be locked
    - Time slot must not conflict with existing scheduled courses
    - Time slot must belong to the specified course offering
    
    Returns the updated schedule object on success.
    """
    return await add_course_to_schedule(
        request,
        user_id,
        course_data.course_offering_id,
        course_data.time_slot_id,
        course_data.org_id,
        current_user,
        db_session,
    )


@router.delete("/{user_id}/courses/{scheduled_course_id}", response_model=ScheduleWithDetails)
async def api_remove_course_from_schedule(
    request: Request,
    user_id: int,
    scheduled_course_id: int,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> ScheduleWithDetails:
    """
    Remove a specific course from a user's schedule.
    
    VALIDATION:
    - Schedule must not be locked
    - Scheduled course must belong to the user's schedule
    
    Returns the updated schedule object on success.
    """
    return await remove_course_from_schedule(
        request, user_id, scheduled_course_id, current_user, db_session
    )


@router.get("/{user_id}/available-slots/{course_offering_id}", response_model=List[TimeSlotRead])
async def api_get_available_time_slots(
    request: Request,
    user_id: int,
    course_offering_id: int,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> List[TimeSlotRead]:
    """
    Get all available, non-conflicting time slots for a given course offering.
    
    This endpoint returns time slots that:
    - Belong to the specified course offering
    - Do not conflict with the user's current schedule
    - Can be used by the frontend to highlight valid drop zones
    
    SECURITY:
    - Only the user themselves or users with admin/maintainer roles can access it
    """
    return await get_available_time_slots(
        request, course_offering_id, user_id, current_user, db_session
    )


@router.patch("/{user_id}/lock", response_model=ScheduleWithDetails)
async def api_toggle_schedule_lock(
    request: Request,
    user_id: int,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> ScheduleWithDetails:
    """
    Toggle the lock status of a user's schedule.
    
    When locked:
    - Schedule cannot be modified (add/remove courses)
    - Prevents accidental changes during registration periods
    
    When unlocked:
    - Schedule can be freely modified
    - Users can add/remove courses as needed
    
    SECURITY:
    - Only the user themselves or users with admin/maintainer roles can toggle lock status
    """
    return await toggle_schedule_lock(request, user_id, current_user, db_session)
