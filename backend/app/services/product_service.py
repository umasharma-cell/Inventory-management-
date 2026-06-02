from math import ceil
from uuid import UUID

from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.exceptions import AppException


class ProductService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_product(self, payload: ProductCreate) -> Product:
        self._ensure_sku_is_unique(payload.sku)

        product = Product(**payload.model_dump())
        self.db.add(product)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise AppException(
                "Product SKU already exists",
                status.HTTP_409_CONFLICT,
            ) from exc

        self.db.refresh(product)
        return product

    def list_products(
        self,
        page: int,
        limit: int,
        search: str | None = None,
    ) -> tuple[list[Product], dict[str, int]]:
        query = select(Product)
        count_query = select(func.count(Product.id))

        if search:
            search_filter = Product.name.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total = self.db.scalar(count_query) or 0
        products = list(
            self.db.scalars(
                query.order_by(Product.created_at.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            )
        )
        total_pages = ceil(total / limit) if total else 0

        return products, {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
        }

    def get_product(self, product_id: UUID) -> Product:
        product = self.db.get(Product, product_id)
        if product is None:
            raise AppException("Product not found", status.HTTP_404_NOT_FOUND)
        return product

    def update_product(self, product_id: UUID, payload: ProductUpdate) -> Product:
        product = self.get_product(product_id)
        update_data = payload.model_dump(exclude_unset=True)

        if "sku" in update_data and update_data["sku"] != product.sku:
            self._ensure_sku_is_unique(update_data["sku"], exclude_id=product_id)

        for field, value in update_data.items():
            setattr(product, field, value)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise AppException(
                "Product SKU already exists",
                status.HTTP_409_CONFLICT,
            ) from exc

        self.db.refresh(product)
        return product

    def delete_product(self, product_id: UUID) -> None:
        product = self.get_product(product_id)
        self.db.delete(product)
        self.db.commit()

    def _ensure_sku_is_unique(
        self,
        sku: str,
        exclude_id: UUID | None = None,
    ) -> None:
        query = select(Product).where(Product.sku == sku)
        if exclude_id is not None:
            query = query.where(Product.id != exclude_id)

        if self.db.scalar(query) is not None:
            raise AppException(
                "Product SKU already exists",
                status.HTTP_409_CONFLICT,
            )
