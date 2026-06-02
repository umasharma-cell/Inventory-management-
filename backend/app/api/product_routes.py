from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.common import ErrorResponse
from app.schemas.product import (
    ProductCreate,
    ProductCreateResponse,
    ProductDeleteResponse,
    ProductListResponse,
    ProductReadResponse,
    ProductUpdate,
)
from app.services.product_service import ProductService
from app.utils.responses import success_response

router = APIRouter(prefix="/products", tags=["Products"])

PRODUCT_ERROR_RESPONSES = {
    400: {"model": ErrorResponse, "description": "Invalid product operation"},
    404: {"model": ErrorResponse, "description": "Product not found"},
    409: {"model": ErrorResponse, "description": "SKU already exists"},
    422: {"model": ErrorResponse, "description": "Validation failed"},
}


def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(db)


@router.post(
    "",
    response_model=ProductCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create product",
    description="Create a product with a unique SKU and non-negative stock quantity.",
    responses={
        409: PRODUCT_ERROR_RESPONSES[409],
        422: PRODUCT_ERROR_RESPONSES[422],
    },
)
def create_product(
    payload: ProductCreate,
    service: ProductService = Depends(get_product_service),
) -> dict:
    product = service.create_product(payload)
    return success_response("Product created", product)


@router.get(
    "",
    response_model=ProductListResponse,
    status_code=status.HTTP_200_OK,
    summary="List products",
    description="Retrieve paginated products with optional case-insensitive name search.",
    responses={422: PRODUCT_ERROR_RESPONSES[422]},
)
def list_products(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    limit: int = Query(10, ge=1, le=100, description="Number of products per page"),
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=255,
        description="Optional product name search term",
    ),
    service: ProductService = Depends(get_product_service),
) -> dict:
    products, meta = service.list_products(page=page, limit=limit, search=search)
    return success_response(
        "Products retrieved",
        {
            "items": products,
            "meta": meta,
        },
    )


@router.get(
    "/{product_id}",
    response_model=ProductReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Get product by ID",
    description="Retrieve a single product by UUID.",
    responses={
        404: PRODUCT_ERROR_RESPONSES[404],
        422: PRODUCT_ERROR_RESPONSES[422],
    },
)
def get_product(
    product_id: UUID,
    service: ProductService = Depends(get_product_service),
) -> dict:
    product = service.get_product(product_id)
    return success_response("Product retrieved", product)


@router.put(
    "/{product_id}",
    response_model=ProductReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Update product",
    description="Update product details while preserving SKU uniqueness and stock validation.",
    responses={
        404: PRODUCT_ERROR_RESPONSES[404],
        409: PRODUCT_ERROR_RESPONSES[409],
        422: PRODUCT_ERROR_RESPONSES[422],
    },
)
def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    service: ProductService = Depends(get_product_service),
) -> dict:
    product = service.update_product(product_id, payload)
    return success_response("Product updated", product)


@router.delete(
    "/{product_id}",
    response_model=ProductDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete product",
    description="Delete a product by UUID.",
    responses={
        404: PRODUCT_ERROR_RESPONSES[404],
        422: PRODUCT_ERROR_RESPONSES[422],
    },
)
def delete_product(
    product_id: UUID,
    service: ProductService = Depends(get_product_service),
) -> dict:
    service.delete_product(product_id)
    return success_response("Product deleted")
