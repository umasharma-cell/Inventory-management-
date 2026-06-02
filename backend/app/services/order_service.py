from collections import defaultdict
from decimal import Decimal
from math import ceil
from uuid import UUID

from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.utils.exceptions import AppException


class OrderService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_order(self, payload: OrderCreate) -> Order:
        try:
            self._ensure_customer_exists(payload.customer_id)
            requested_quantities = self._aggregate_requested_quantities(payload)
            products = self._get_products_for_update(list(requested_quantities))
            self._validate_products_exist(products, requested_quantities)
            self._validate_stock(products, requested_quantities)

            order = Order(customer_id=payload.customer_id, total_amount=Decimal("0.00"))
            self.db.add(order)
            self.db.flush()

            total_amount = Decimal("0.00")
            order_items: list[OrderItem] = []

            for product_id, quantity in requested_quantities.items():
                product = products[product_id]
                unit_price = product.price
                total_amount += unit_price * quantity
                product.quantity_in_stock -= quantity
                order_items.append(
                    OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=quantity,
                        unit_price=unit_price,
                    )
                )

            order.total_amount = total_amount
            self.db.add_all(order_items)
            self.db.commit()
            return self.get_order(order.id)
        except AppException:
            self.db.rollback()
            raise
        except IntegrityError as exc:
            self.db.rollback()
            raise AppException(
                "Order could not be created",
                status.HTTP_400_BAD_REQUEST,
            ) from exc

    def list_orders(self, page: int, limit: int) -> tuple[list[Order], dict[str, int]]:
        total = self.db.scalar(select(func.count(Order.id))) or 0
        orders = list(
            self.db.scalars(
                self._detail_query()
                .order_by(Order.created_at.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            )
        )
        total_pages = ceil(total / limit) if total else 0

        return orders, {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
        }

    def get_order(self, order_id: UUID) -> Order:
        order = self.db.scalar(self._detail_query().where(Order.id == order_id))
        if order is None:
            raise AppException("Order not found", status.HTTP_404_NOT_FOUND)
        return order

    def delete_order(self, order_id: UUID) -> Order:
        try:
            order = self.get_order(order_id)
            product_ids = [item.product_id for item in order.items]
            products = self._get_products_for_update(product_ids)

            for item in order.items:
                product = products.get(item.product_id)
                if product is not None:
                    product.quantity_in_stock += item.quantity

            self.db.delete(order)
            self.db.commit()
            return order
        except AppException:
            self.db.rollback()
            raise
        except IntegrityError as exc:
            self.db.rollback()
            raise AppException(
                "Order could not be deleted",
                status.HTTP_400_BAD_REQUEST,
            ) from exc

    def _ensure_customer_exists(self, customer_id: UUID) -> None:
        if self.db.get(Customer, customer_id) is None:
            raise AppException("Customer not found", status.HTTP_404_NOT_FOUND)

    def _aggregate_requested_quantities(self, payload: OrderCreate) -> dict[UUID, int]:
        quantities: dict[UUID, int] = defaultdict(int)
        for item in payload.items:
            quantities[item.product_id] += item.quantity
        return dict(quantities)

    def _get_products_for_update(self, product_ids: list[UUID]) -> dict[UUID, Product]:
        if not product_ids:
            return {}

        products = self.db.scalars(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
        return {product.id: product for product in products}

    def _validate_products_exist(
        self,
        products: dict[UUID, Product],
        requested_quantities: dict[UUID, int],
    ) -> None:
        missing_ids = [
            str(product_id)
            for product_id in requested_quantities
            if product_id not in products
        ]
        if missing_ids:
            raise AppException(
                "Product not found",
                status.HTTP_404_NOT_FOUND,
                {"product_ids": missing_ids},
            )

    def _validate_stock(
        self,
        products: dict[UUID, Product],
        requested_quantities: dict[UUID, int],
    ) -> None:
        insufficient_items = []
        for product_id, requested_quantity in requested_quantities.items():
            product = products[product_id]
            if product.quantity_in_stock < requested_quantity:
                insufficient_items.append(
                    {
                        "product_id": str(product_id),
                        "available": product.quantity_in_stock,
                        "requested": requested_quantity,
                    }
                )

        if insufficient_items:
            raise AppException(
                "Insufficient stock",
                status.HTTP_400_BAD_REQUEST,
                {"items": insufficient_items},
            )

    def _detail_query(self):
        return select(Order).options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
