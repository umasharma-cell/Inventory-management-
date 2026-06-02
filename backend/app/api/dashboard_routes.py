from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import DashboardService
from app.utils.responses import success_response

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_dashboard_service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(db)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get dashboard summary",
    description="Return aggregate inventory, customer, order, and low-stock metrics for the dashboard.",
)
def get_dashboard_summary(
    service: DashboardService = Depends(get_dashboard_service),
) -> dict:
    return success_response("Dashboard summary retrieved", service.get_summary())
