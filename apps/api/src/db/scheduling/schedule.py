from typing import Optional
from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, SQLModel


class ScheduleBase(SQLModel):
    is_locked: bool = Field(default=False)


class Schedule(ScheduleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), unique=True)
    )
    creation_date: str = ""
    update_date: str = ""


class ScheduleCreate(ScheduleBase):
    user_id: int


class ScheduleUpdate(SQLModel):
    is_locked: Optional[bool] = None


class ScheduleRead(ScheduleBase):
    id: int
    user_id: int
    creation_date: str
    update_date: str
