from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.common import ErrorResponse
from app.schemas.order import (
    OrderCreate,
    OrderCreateResponse,
    OrderListResponse,
    OrderReadResponse,
)
from app.services.order_service import OrderService
from app.utils.responses import success_response

router = APIRouter(prefix="/orders", tags=["Orders"])

ORDER_ERROR_RESPONSES = {
    400: {"model": ErrorResponse, "description": "Invalid order operation"},
    404: {"model": ErrorResponse, "description": "Customer, product, or order not found"},
    422: {"model": ErrorResponse, "description": "Validation failed"},
}


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    return OrderService(db)


@router.post(
    "",
    response_model=OrderCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create order",
    description=(
        "Create an order for one customer with one or more products. "
        "The backend validates inventory, calculates the total amount, "
        "and deducts stock transactionally."
    ),
    responses={
        400: ORDER_ERROR_RESPONSES[400],
        404: ORDER_ERROR_RESPONSES[404],
        422: ORDER_ERROR_RESPONSES[422],
    },
)
def create_order(
    payload: OrderCreate,
    service: OrderService = Depends(get_order_service),
) -> dict:
    order = service.create_order(payload)
    return success_response("Order created", order)


@router.get(
    "",
    response_model=OrderListResponse,
    status_code=status.HTTP_200_OK,
    summary="List orders",
    description="Retrieve detailed orders using page-based pagination.",
    responses={422: ORDER_ERROR_RESPONSES[422]},
)
def list_orders(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    limit: int = Query(10, ge=1, le=100, description="Number of orders per page"),
    service: OrderService = Depends(get_order_service),
) -> dict:
    orders, meta = service.list_orders(page=page, limit=limit)
    return success_response(
        "Orders retrieved",
        {
            "items": orders,
            "meta": meta,
        },
    )


@router.get(
    "/{order_id}",
    response_model=OrderReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Get order by ID",
    description="Retrieve a detailed order by UUID, including customer and product items.",
    responses={
        404: ORDER_ERROR_RESPONSES[404],
        422: ORDER_ERROR_RESPONSES[422],
    },
)
def get_order(
    order_id: UUID,
    service: OrderService = Depends(get_order_service),
) -> dict:
    order = service.get_order(order_id)
    return success_response("Order retrieved", order)


@router.delete(
    "/{order_id}",
    response_model=OrderReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete order",
    description="Delete an order transactionally and restore its product stock quantities.",
    responses={
        400: ORDER_ERROR_RESPONSES[400],
        404: ORDER_ERROR_RESPONSES[404],
        422: ORDER_ERROR_RESPONSES[422],
    },
)
def delete_order(
    order_id: UUID,
    service: OrderService = Depends(get_order_service),
) -> dict:
    order = service.delete_order(order_id)
    return success_response("Order deleted", order)
