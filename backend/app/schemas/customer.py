from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(
        ...,
        min_length=7,
        max_length=30,
        pattern=r"^\+?[0-9][0-9\s()-]{6,29}$",
    )


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerListMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class CustomerCreateResponse(BaseModel):
    success: bool = True
    message: str
    data: CustomerRead


class CustomerReadResponse(BaseModel):
    success: bool = True
    message: str
    data: CustomerRead


class CustomerListData(BaseModel):
    items: list[CustomerRead]
    meta: CustomerListMeta


class CustomerListResponse(BaseModel):
    success: bool = True
    message: str
    data: CustomerListData


class CustomerDeleteResponse(BaseModel):
    success: bool = True
    message: str
    data: None = None
