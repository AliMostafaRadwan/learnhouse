from typing import List
from fastapi import APIRouter, Depends, Request
from sqlmodel import Session, select
from src.core.events.database import get_db_session
from src.db.scheduling import TimeSlotRead, CourseOfferingRead, CourseOffering, TimeSlot
from src.db.users import PublicUser
from src.db.courses.courses import Course, CourseRead
from src.security.auth import get_current_user
from src.services.scheduling.schedules import get_available_time_slots

router = APIRouter()


@router.get("/{course_offering_id}/available-slots", response_model=List[TimeSlotRead])
async def api_get_course_offering_available_slots(
    request: Request,
    course_offering_id: int,
    user_id: int,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> List[TimeSlotRead]:
    """
    Get all available, non-conflicting time slots for a given course offering.
    
    This is a helper endpoint that returns time slots that:
    - Belong to the specified course offering
    - Do not conflict with the user's current schedule
    - Can be used by the frontend to highlight valid drop zones
    
    SECURITY:
    - Only the user themselves or users with admin/maintainer roles can access it
    """
    return await get_available_time_slots(
        request, course_offering_id, user_id, current_user, db_session
    )


@router.get("/org/{org_id}/available", response_model=List[dict])
async def api_get_available_course_offerings(
    request: Request,
    org_id: int,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> List[dict]:
    """
    Get all available course offerings for an organization.
    
    Returns course offerings with their associated courses and available time slots.
    This endpoint is used by the frontend to populate the sidebar with draggable courses.
    
    SECURITY:
    - Only authenticated users can access this endpoint
    """
    # Get all course offerings for the organization with their courses
    statement = (
        select(CourseOffering, Course)
        .join(Course, CourseOffering.course_id == Course.id)
        .where(CourseOffering.org_id == org_id)
        .order_by(Course.name, CourseOffering.course_type)
    )
    
    results = db_session.exec(statement).all()
    
    available_offerings = []
    for course_offering, course in results:
        # Get available time slots for this course offering
        statement = select(TimeSlot).where(TimeSlot.course_offering_id == course_offering.id)
        time_slots = db_session.exec(statement).all()
        
        if time_slots:  # Only include offerings that have time slots
            available_offerings.append({
                "course_offering": CourseOfferingRead.model_validate(course_offering),
                "course": CourseRead.model_validate(course),
                "available_time_slots": [TimeSlotRead.model_validate(ts) for ts in time_slots]
            })
    
    return available_offerings
