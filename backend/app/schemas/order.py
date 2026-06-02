from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.customer import CustomerRead
from app.schemas.product import ProductRead


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: UUID
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemRead(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: UUID
    customer_id: UUID
    total_amount: Decimal
    created_at: datetime
    customer: CustomerRead
    items: list[OrderItemRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class OrderListMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class OrderCreateResponse(BaseModel):
    success: bool = True
    message: str
    data: OrderRead


class OrderReadResponse(BaseModel):
    success: bool = True
    message: str
    data: OrderRead


class OrderListData(BaseModel):
    items: list[OrderRead]
    meta: OrderListMeta


class OrderListResponse(BaseModel):
    success: bool = True
    message: str
    data: OrderListData
