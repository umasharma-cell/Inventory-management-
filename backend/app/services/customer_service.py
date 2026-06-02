from math import ceil
from uuid import UUID

from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate
from app.utils.exceptions import AppException


class CustomerService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_customer(self, payload: CustomerCreate) -> Customer:
        email = payload.email.lower()
        self._ensure_email_is_unique(email)

        customer = Customer(
            full_name=payload.full_name,
            email=email,
            phone=payload.phone,
        )
        self.db.add(customer)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise AppException(
                "Customer email already exists",
                status.HTTP_409_CONFLICT,
            ) from exc

        self.db.refresh(customer)
        return customer

    def list_customers(self, page: int, limit: int) -> tuple[list[Customer], dict[str, int]]:
        total = self.db.scalar(select(func.count(Customer.id))) or 0
        customers = list(
            self.db.scalars(
                select(Customer)
                .order_by(Customer.created_at.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            )
        )
        total_pages = ceil(total / limit) if total else 0

        return customers, {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
        }

    def get_customer(self, customer_id: UUID) -> Customer:
        customer = self.db.get(Customer, customer_id)
        if customer is None:
            raise AppException("Customer not found", status.HTTP_404_NOT_FOUND)
        return customer

    def delete_customer(self, customer_id: UUID) -> None:
        customer = self.get_customer(customer_id)
        self.db.delete(customer)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise AppException(
                "Customer cannot be deleted because it is linked to existing orders",
                status.HTTP_409_CONFLICT,
            ) from exc

    def _ensure_email_is_unique(self, email: str) -> None:
        query = select(Customer).where(func.lower(Customer.email) == email)
        if self.db.scalar(query) is not None:
            raise AppException(
                "Customer email already exists",
                status.HTTP_409_CONFLICT,
            )
