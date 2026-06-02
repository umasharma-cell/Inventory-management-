from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.common import ErrorResponse
from app.schemas.customer import (
    CustomerCreate,
    CustomerCreateResponse,
    CustomerDeleteResponse,
    CustomerListResponse,
    CustomerReadResponse,
)
from app.services.customer_service import CustomerService
from app.utils.responses import success_response

router = APIRouter(prefix="/customers", tags=["Customers"])

CUSTOMER_ERROR_RESPONSES = {
    404: {"model": ErrorResponse, "description": "Customer not found"},
    409: {"model": ErrorResponse, "description": "Email already exists or customer is in use"},
    422: {"model": ErrorResponse, "description": "Validation failed"},
}


def get_customer_service(db: Session = Depends(get_db)) -> CustomerService:
    return CustomerService(db)


@router.post(
    "",
    response_model=CustomerCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create customer",
    description="Create a customer with a unique email address and validated phone number.",
    responses={
        409: CUSTOMER_ERROR_RESPONSES[409],
        422: CUSTOMER_ERROR_RESPONSES[422],
    },
)
def create_customer(
    payload: CustomerCreate,
    service: CustomerService = Depends(get_customer_service),
) -> dict:
    customer = service.create_customer(payload)
    return success_response("Customer created", customer)


@router.get(
    "",
    response_model=CustomerListResponse,
    status_code=status.HTTP_200_OK,
    summary="List customers",
    description="Retrieve customers using page-based pagination.",
    responses={422: CUSTOMER_ERROR_RESPONSES[422]},
)
def list_customers(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    limit: int = Query(10, ge=1, le=100, description="Number of customers per page"),
    service: CustomerService = Depends(get_customer_service),
) -> dict:
    customers, meta = service.list_customers(page=page, limit=limit)
    return success_response(
        "Customers retrieved",
        {
            "items": customers,
            "meta": meta,
        },
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer by ID",
    description="Retrieve a single customer by UUID.",
    responses={
        404: CUSTOMER_ERROR_RESPONSES[404],
        422: CUSTOMER_ERROR_RESPONSES[422],
    },
)
def get_customer(
    customer_id: UUID,
    service: CustomerService = Depends(get_customer_service),
) -> dict:
    customer = service.get_customer(customer_id)
    return success_response("Customer retrieved", customer)


@router.delete(
    "/{customer_id}",
    response_model=CustomerDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete customer",
    description="Delete a customer by UUID when it is not linked to existing orders.",
    responses={
        404: CUSTOMER_ERROR_RESPONSES[404],
        409: CUSTOMER_ERROR_RESPONSES[409],
        422: CUSTOMER_ERROR_RESPONSES[422],
    },
)
def delete_customer(
    customer_id: UUID,
    service: CustomerService = Depends(get_customer_service),
) -> dict:
    service.delete_customer(customer_id)
    return success_response("Customer deleted")
