from typing import Optional
from enum import Enum
from sqlalchemy import Column, ForeignKey, Integer, Time
from sqlmodel import Field, SQLModel


class DayOfWeekEnum(str, Enum):
    SUNDAY = "Sunday"
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"


class TimeSlotBase(SQLModel):
    day_of_week: DayOfWeekEnum
    start_time: str  # Format: "HH:MM" (e.g., "08:30")
    end_time: str    # Format: "HH:MM" (e.g., "10:20")


class TimeSlot(TimeSlotBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_offering_id: int = Field(
        sa_column=Column(Integer, ForeignKey("courseoffering.id", ondelete="CASCADE"))
    )
    org_id: int = Field(
        sa_column=Column(Integer, ForeignKey("organization.id", ondelete="CASCADE"))
    )
    creation_date: str = ""
    update_date: str = ""


class TimeSlotCreate(TimeSlotBase):
    course_offering_id: int
    org_id: int


class TimeSlotUpdate(SQLModel):
    day_of_week: Optional[DayOfWeekEnum] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


class TimeSlotRead(TimeSlotBase):
    id: int
    course_offering_id: int
    org_id: int
    creation_date: str
    update_date: str
