from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class WorkerAvailabilityUpdate(BaseModel):
    """
    Availability update used by the older worker-ID endpoint:

        PATCH /workers/{worker_id}/availability
    """

    availability_status: Literal["online", "offline"]

    model_config = ConfigDict(
        str_strip_whitespace=True,
    )


class WorkerVerificationUpdate(BaseModel):
    verification_status: str
    verification_level: str
    verification_note: Optional[str] = None

    model_config = ConfigDict(
        str_strip_whitespace=True,
    )


class CurrentWorkerAvailabilityUpdate(BaseModel):
    """
    Availability update for the currently authenticated worker:

        PATCH /workers/availability
    """

    availability_status: Literal["online", "offline"]

    model_config = ConfigDict(
        str_strip_whitespace=True,
    )