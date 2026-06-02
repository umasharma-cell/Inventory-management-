from fastapi import APIRouter

from app.utils.responses import success_response

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check() -> dict:
    return success_response(
        message="Service is healthy",
        data={"status": "ok"},
    )
