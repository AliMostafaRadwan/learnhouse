from typing import List
from fastapi import APIRouter, Depends, Request
from sqlmodel import Session
from src.core.events.database import get_db_session
from src.db.scheduling import TimeSlotRead
from src.db.users import PublicUser
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
