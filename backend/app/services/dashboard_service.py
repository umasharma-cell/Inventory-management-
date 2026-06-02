from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product


LOW_STOCK_THRESHOLD = 5


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_summary(self) -> dict:
        total_products = self.db.scalar(select(func.count(Product.id))) or 0
        total_customers = self.db.scalar(select(func.count(Customer.id))) or 0
        total_orders = self.db.scalar(select(func.count(Order.id))) or 0

        low_stock_query = (
            select(Product)
            .where(Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
            .order_by(Product.quantity_in_stock.asc(), Product.name.asc())
            .limit(10)
        )
        low_stock_products = list(self.db.scalars(low_stock_query))
        low_stock_count = (
            self.db.scalar(
                select(func.count(Product.id)).where(
                    Product.quantity_in_stock <= LOW_STOCK_THRESHOLD
                )
            )
            or 0
        )

        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_count": low_stock_count,
            "low_stock_products": low_stock_products,
        }
