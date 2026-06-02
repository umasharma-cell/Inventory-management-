from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    quantity_in_stock: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    quantity_in_stock: int | None = Field(default=None, ge=0)


class ProductRead(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class ProductCreateResponse(BaseModel):
    success: bool = True
    message: str
    data: ProductRead


class ProductReadResponse(BaseModel):
    success: bool = True
    message: str
    data: ProductRead


class ProductListData(BaseModel):
    items: list[ProductRead]
    meta: ProductListMeta


class ProductListResponse(BaseModel):
    success: bool = True
    message: str
    data: ProductListData


class ProductDeleteResponse(BaseModel):
    success: bool = True
    message: str
    data: None = None
