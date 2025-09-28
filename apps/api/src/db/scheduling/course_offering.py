from typing import Optional
from enum import Enum
from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, SQLModel


class CourseTypeEnum(str, Enum):
    LECTURE = "Lecture"
    SECTION = "Section"
    LAB = "Lab"
    TUTORIAL = "Tutorial"
    SEMINAR = "Seminar"


class CourseOfferingBase(SQLModel):
    course_type: CourseTypeEnum
    lecturer_name: str
    location: str


class CourseOffering(CourseOfferingBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(
        sa_column=Column(Integer, ForeignKey("course.id", ondelete="CASCADE"))
    )
    org_id: int = Field(
        sa_column=Column(Integer, ForeignKey("organization.id", ondelete="CASCADE"))
    )
    creation_date: str = ""
    update_date: str = ""


class CourseOfferingCreate(CourseOfferingBase):
    course_id: int
    org_id: int


class CourseOfferingUpdate(SQLModel):
    course_type: Optional[CourseTypeEnum] = None
    lecturer_name: Optional[str] = None
    location: Optional[str] = None


class CourseOfferingRead(CourseOfferingBase):
    id: int
    course_id: int
    org_id: int
    creation_date: str
    update_date: str
