from typing import Optional
from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, SQLModel


class ScheduledCourseBase(SQLModel):
    pass  # This is a pure join table with no additional fields


class ScheduledCourse(ScheduledCourseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    schedule_id: int = Field(
        sa_column=Column(Integer, ForeignKey("schedule.id", ondelete="CASCADE"))
    )
    timeslot_id: int = Field(
        sa_column=Column(Integer, ForeignKey("timeslot.id", ondelete="CASCADE"))
    )
    org_id: int = Field(
        sa_column=Column(Integer, ForeignKey("organization.id", ondelete="CASCADE"))
    )
    creation_date: str = ""
    update_date: str = ""


class ScheduledCourseCreate(ScheduledCourseBase):
    schedule_id: int
    timeslot_id: int
    org_id: int


class ScheduledCourseRead(ScheduledCourseBase):
    id: int
    schedule_id: int
    timeslot_id: int
    org_id: int
    creation_date: str
    update_date: str
