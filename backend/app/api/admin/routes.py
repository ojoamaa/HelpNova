from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker import WorkerResponse
from app.schemas.worker_update import WorkerVerificationUpdate
from app.services.worker_service import update_worker_verification

from sqlalchemy import func

from app.models.job import Job
from app.models.worker import Worker
from app.models.dispute import Dispute
from app.models.payment import Payment

from app.models.job_assignment import JobAssignment
from app.models.job_photo import JobPhoto

from app.models.payment import Payment
from app.models.worker_review import WorkerReview

from app.models.user import User



router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.patch("/workers/{worker_id}/verify")
def verify_worker(
    worker_id: str,
    update_data: WorkerVerificationUpdate,
    db: Session = Depends(get_db)
):
    worker = update_worker_verification(
        db=db,
        worker_id=worker_id,
        verification_status=update_data.verification_status,
        verification_level=update_data.verification_level,
        verification_note=update_data.verification_note
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return worker

@router.get("/analytics")
def admin_analytics(
    db: Session = Depends(get_db)
):
    total_jobs = db.query(Job).count()

    completed_jobs = (
        db.query(Job)
        .filter(Job.status == "completed")
        .count()
    )

    pending_jobs = (
        db.query(Job)
        .filter(Job.status.in_([
            "open",
            "assigned",
            "in_progress"
        ]))
        .count()
    )

    total_workers = (
        db.query(Worker)
        .count()
    )

    verified_workers = (
        db.query(Worker)
        .filter(
            Worker.verification_status == "approved"
        )
        .count()
    )

    open_disputes = (
        db.query(Dispute)
        .filter(
            Dispute.status == "open"
        )
        .count()
    )

    resolved_disputes = (
        db.query(Dispute)
        .filter(
            Dispute.status == "resolved"
        )
        .count()
    )

    total_payments = (
        db.query(Payment)
        .count()
    )

    revenue = (
        db.query(
            func.sum(Payment.amount)
        )
        .scalar()
        or 0
    )

    return {
        "jobs": {
            "total": total_jobs,
            "completed": completed_jobs,
            "pending": pending_jobs
        },
        "workers": {
            "total": total_workers,
            "verified": verified_workers
        },
        "disputes": {
            "open": open_disputes,
            "resolved": resolved_disputes
        },
        "payments": {
            "total_transactions": total_payments,
            "revenue": revenue
        }
    }

@router.get("/jobs")
def admin_list_jobs(
    status: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job)

    if status:
        query = query.filter(Job.status == status)

    jobs = query.all()

    return [
        {
            "job_id": job.id,
            "customer_id": job.customer_id,
            "title": job.title,
            "description": job.description,
            "status": job.status,
            "state": job.state,
            "city": job.city,
            "area": job.area,
            "created_at": job.created_at
        }
        for job in jobs
    ]


@router.get("/jobs/{job_id}")
def admin_get_job_details(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    assignments = (
        db.query(JobAssignment)
        .filter(JobAssignment.job_id == job_id)
        .all()
    )

    photos = (
        db.query(JobPhoto)
        .filter(JobPhoto.job_id == job_id)
        .all()
    )

    disputes = (
        db.query(Dispute)
        .filter(Dispute.job_id == job_id)
        .all()
    )

    return {
        "job": {
            "job_id": job.id,
            "customer_id": job.customer_id,
            "category_id": job.category_id,
            "title": job.title,
            "description": job.description,
            "status": job.status,
            "state": job.state,
            "city": job.city,
            "area": job.area,
            "job_type": job.job_type,
            "created_at": job.created_at
        },
        "assignments": [
            {
                "assignment_id": a.id,
                "worker_id": a.worker_id,
                "company_id": a.company_id,
                "assigned_to_type": a.assigned_to_type,
                "status": a.status,
                "assigned_at": a.assigned_at,
                "accepted_at": a.accepted_at,
                "rejected_at": a.rejected_at,
                "completed_at": a.completed_at
            }
            for a in assignments
        ],
      "photos": [
    {
        "photo_id": p.id,
        "photo_url": p.photo_url,
        "photo_type": p.photo_type,
        "uploaded_by": p.uploaded_by,
        "created_at": p.created_at
    }
    for p in photos
],
        "disputes": [
            {
                "dispute_id": d.id,
                "title": d.title,
                "description": d.description,
                "status": d.status,
                "resolution": d.resolution,
                "created_at": d.created_at,
                "resolved_at": d.resolved_at
            }
            for d in disputes
        ]
    }

@router.get("/workers")
def admin_list_workers(
    status: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Worker)

    if status:
        query = query.filter(Worker.verification_status == status)

    workers = query.all()

    return [
        {
            "worker_id": w.id,
            "user_id": w.user_id,
            "full_name": w.full_name,
            "profession": w.profession,
            "phone_number": w.phone_number,
            "state": w.state,
            "city": w.city,
            "area": w.area,
            "verification_status": w.verification_status,
            "verification_level": w.verification_level,
            "availability_status": w.availability_status,
            "average_rating": w.average_rating,
            "completed_jobs": w.completed_jobs
        }
        for w in workers
    ]


@router.get("/workers/{worker_id}")
def admin_get_worker_details(
    worker_id: str,
    db: Session = Depends(get_db)
):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    assignments = (
        db.query(JobAssignment)
        .filter(JobAssignment.worker_id == worker_id)
        .all()
    )

    reviews = (
        db.query(WorkerReview)
        .filter(WorkerReview.worker_id == worker_id)
        .all()
    )

    payments = (
        db.query(Payment)
        .filter(Payment.worker_id == worker_id)
        .all()
    )

    return {
        "worker": {
            "worker_id": worker.id,
            "user_id": worker.user_id,
            "full_name": worker.full_name,
            "profession": worker.profession,
            "phone_number": worker.phone_number,
            "state": worker.state,
            "city": worker.city,
            "area": worker.area,
            "verification_status": worker.verification_status,
            "verification_level": worker.verification_level,
            "availability_status": worker.availability_status,
            "average_rating": worker.average_rating,
            "completed_jobs": worker.completed_jobs
        },
        "assignments": [
            {
                "assignment_id": a.id,
                "job_id": a.job_id,
                "status": a.status,
                "assigned_at": a.assigned_at,
                "accepted_at": a.accepted_at,
                "rejected_at": a.rejected_at,
                "completed_at": a.completed_at
            }
            for a in assignments
        ],
        "reviews": [
            {
                "review_id": r.id,
                "job_id": r.job_id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at
            }
            for r in reviews
        ],
        "payments": [
            {
                "payment_id": p.id,
                "job_id": p.job_id,
                "amount": p.amount,
                "status": p.status,
                "created_at": p.created_at
            }
            for p in payments
        ]
    }

@router.get("/customers")
def admin_list_customers(
    db: Session = Depends(get_db)
):
    customers = db.query(User).all()

    return [
    {
        "customer_id": user.id,
        "full_name": getattr(user, "full_name", None),
        "phone_number": getattr(user, "phone_number", None),
        "email": getattr(user, "email", None)
    }
    for user in customers
]


@router.get("/customers")
def admin_list_customers(db: Session = Depends(get_db)):
    customers = db.query(User).all()

    return [
        {
            "customer_id": user.id,
            "full_name": getattr(user, "full_name", None),
            "email": getattr(user, "email", None),
            "phone_number": getattr(user, "phone_number", None),
        }
        for user in customers
    ]


@router.get("/customers/{customer_id}")
def admin_get_customer_details(
    customer_id: str,
    db: Session = Depends(get_db)
):
    customer = db.query(User).filter(User.id == customer_id).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    jobs = db.query(Job).filter(Job.customer_id == customer_id).all()

    return {
        "customer": {
            "customer_id": customer.id,
            "full_name": getattr(customer, "full_name", None),
            "email": getattr(customer, "email", None),
            "phone_number": getattr(customer, "phone_number", None),
        },
        "jobs": [
            {
                "job_id": job.id,
                "title": job.title,
                "description": job.description,
                "status": job.status,
                "state": job.state,
                "city": job.city,
                "area": job.area,
                "created_at": job.created_at,
            }
            for job in jobs
        ],
        "summary": {
            "total_jobs": len(jobs),
            "completed_jobs": len([job for job in jobs if job.status == "completed"]),
            "pending_jobs": len([job for job in jobs if job.status == "pending"]),
            "assigned_jobs": len([job for job in jobs if job.status == "assigned"]),
        }
    }