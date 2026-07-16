from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker import WorkerResponse
from app.schemas.worker_update import WorkerVerificationUpdate
from app.services.worker_service import update_worker_verification

from sqlalchemy import case, func

from app.models.job import Job
from app.models.worker import Worker
from app.models.dispute import Dispute

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
    customers = (
        db.query(User)
        .filter(User.role == "customer")
        .order_by(User.full_name.asc())
        .all()
    )

    customer_records = []

    for customer in customers:
        jobs = (
            db.query(Job)
            .filter(Job.customer_id == customer.id)
            .all()
        )

        total_jobs = len(jobs)

        completed_jobs = len([
            job for job in jobs
            if job.status == "completed"
        ])

        pending_jobs = len([
            job for job in jobs
            if job.status == "pending"
        ])

        assigned_jobs = len([
            job for job in jobs
            if job.status == "assigned"
        ])

        latest_job = (
            db.query(Job)
            .filter(Job.customer_id == customer.id)
            .order_by(Job.created_at.desc())
            .first()
        )

        total_spent = (
            db.query(func.sum(Payment.amount))
            .filter(
                Payment.customer_id == customer.id,
                Payment.status.in_(["paid", "released"])
            )
            .scalar()
            or 0
        )

        latest_payment = (
            db.query(Payment)
            .filter(Payment.customer_id == customer.id)
            .order_by(Payment.created_at.desc())
            .first()
        )

        activity_dates = []

        if latest_job and latest_job.created_at:
            activity_dates.append(latest_job.created_at)

        if latest_payment and latest_payment.created_at:
            activity_dates.append(latest_payment.created_at)

        last_activity = max(activity_dates) if activity_dates else None

        location = "Not provided"

        if latest_job:
            location_parts = [
                latest_job.area,
                latest_job.city,
                latest_job.state,
            ]

            location = ", ".join([
                part for part in location_parts
                if part
            ]) or "Not provided"

        customer_records.append({
            "customer_id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "email": customer.email,
            "profile_photo_url": customer.profile_photo_url,
            "role": customer.role,
            "is_active": customer.is_active,

            "location": location,
            "total_jobs": total_jobs,
            "completed_jobs": completed_jobs,
            "pending_jobs": pending_jobs,
            "assigned_jobs": assigned_jobs,
            "total_spent": float(total_spent),
            "last_activity": last_activity,

            # These fields do not yet exist in the database.
            "verification_status": customer.verification_status or "pending",
            "customer_type": "regular",
            "fraud_flag": False,
            "average_rating": None,
            "created_at": None,
        })

    return customer_records

@router.get("/customers/{customer_id}")
def admin_get_customer_details(
    customer_id: str,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(User)
        .filter(
            User.id == customer_id,
            User.role == "customer",
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    jobs = (
        db.query(Job)
        .filter(Job.customer_id == customer_id)
        .order_by(Job.created_at.desc())
        .all()
    )

    payments = (
        db.query(Payment)
        .filter(Payment.customer_id == customer_id)
        .order_by(Payment.created_at.desc())
        .all()
    )

    total_spent = sum(
        float(payment.amount or 0)
        for payment in payments
        if payment.status in {"paid", "released"}
    )

    completed_payments = sum(
        float(payment.amount or 0)
        for payment in payments
        if payment.status == "released"
    )

    pending_refunds = sum(
        float(payment.amount or 0)
        for payment in payments
        if payment.status == "refunded"
    )

    cancelled_jobs = sum(
        1
        for job in jobs
        if job.status in {"cancelled", "canceled"}
    )

    customer_wallet_balance = 0.0

    escrow_balance = sum(
        float(payment.amount or 0)
        for payment in payments
        if payment.status in {"pending", "paid"}
    )

    average_rating = 0.0
    repeat_workers = 0
    average_completion_time = None
    favourite_category = None

    customer_job_ids = [job.id for job in jobs]

    worker_interactions = []

    if customer_job_ids:
        assignments = (
            db.query(JobAssignment)
            .filter(JobAssignment.job_id.in_(customer_job_ids))
            .all()
        )

        worker_ids = {
            assignment.worker_id
            for assignment in assignments
            if assignment.worker_id
        }

        workers = (
            db.query(Worker)
            .filter(Worker.id.in_(worker_ids))
            .all()
            if worker_ids
            else []
        )

        workers_by_id = {
            worker.id: worker
            for worker in workers
        }

        jobs_by_id = {
            job.id: job
            for job in jobs
        }

        customer_reviews = (
            db.query(WorkerReview)
            .filter(
                WorkerReview.customer_id == customer_id,
                WorkerReview.worker_id.in_(worker_ids),
            )
            .all()
            if worker_ids
            else []
        )

        reviews_by_worker = {}

        for review in customer_reviews:
            reviews_by_worker.setdefault(
                review.worker_id,
                [],
            ).append(review)

        interactions_by_worker = {}

        for assignment in assignments:
            if not assignment.worker_id:
                continue

            worker = workers_by_id.get(
                assignment.worker_id
            )

            job = jobs_by_id.get(
                assignment.job_id
            )

            if not worker or not job:
                continue

            if assignment.worker_id not in interactions_by_worker:
                interactions_by_worker[
                    assignment.worker_id
                ] = {
                    "worker_id": worker.id,
                    "full_name": worker.full_name,
                    "profession": worker.profession,
                    "phone_number": worker.phone_number,
                    "verification_status": (
                        worker.verification_status
                    ),
                    "verification_level": (
                        worker.verification_level
                    ),
                    "average_worker_rating": float(
                        worker.average_rating or 0
                    ),
                    "total_assignments": 0,
                    "accepted_jobs": 0,
                    "completed_jobs": 0,
                    "rejected_jobs": 0,
                    "cancelled_jobs": 0,
                    "customer_average_rating": 0,
                    "customer_reviews_count": 0,
                    "last_job_id": None,
                    "last_job_title": None,
                    "last_job_status": None,
                    "last_interaction_at": None,
                }

            interaction = interactions_by_worker[
                assignment.worker_id
            ]

            interaction["total_assignments"] += 1

            assignment_status = str(
                assignment.status or ""
            ).lower()

            job_status = str(
                job.status or ""
            ).lower()

            if assignment_status == "accepted":
                interaction["accepted_jobs"] += 1

            if (
                assignment_status == "completed"
                or job_status == "completed"
            ):
                interaction["completed_jobs"] += 1

            if assignment_status == "rejected":
                interaction["rejected_jobs"] += 1

            if (
                assignment_status
                in {"cancelled", "canceled"}
                or job_status
                in {"cancelled", "canceled"}
            ):
                interaction["cancelled_jobs"] += 1

            interaction_dates = [
                date_value
                for date_value in [
                    getattr(
                        assignment,
                        "completed_at",
                        None,
                    ),
                    getattr(
                        assignment,
                        "accepted_at",
                        None,
                    ),
                    getattr(
                        assignment,
                        "assigned_at",
                        None,
                    ),
                    getattr(
                        job,
                        "created_at",
                        None,
                    ),
                ]
                if date_value is not None
            ]

            latest_interaction_date = (
                max(interaction_dates)
                if interaction_dates
                else None
            )

            current_last_date = interaction[
                "last_interaction_at"
            ]

            if (
                current_last_date is None
                or (
                    latest_interaction_date is not None
                    and latest_interaction_date
                    > current_last_date
                )
            ):
                interaction[
                    "last_interaction_at"
                ] = latest_interaction_date

                interaction["last_job_id"] = job.id
                interaction["last_job_title"] = job.title
                interaction["last_job_status"] = (
                    job.status
                )

        for worker_id, interaction in (
            interactions_by_worker.items()
        ):
            worker_reviews = reviews_by_worker.get(
                worker_id,
                [],
            )

            review_ratings = [
                review.rating
                for review in worker_reviews
                if review.rating is not None
            ]

            interaction[
                "customer_reviews_count"
            ] = len(review_ratings)

            interaction[
                "customer_average_rating"
            ] = (
                round(
                    sum(review_ratings)
                    / len(review_ratings),
                    2,
                )
                if review_ratings
                else 0
            )

            worker_interactions.append(
                interaction
            )

        worker_interactions.sort(
            key=lambda interaction: (
                interaction[
                    "last_interaction_at"
                ]
                is not None,
                interaction[
                    "last_interaction_at"
                ],
            ),
            reverse=True,
        )

    return {
        "customer": {
            "customer_id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "email": customer.email,
            "profile_photo_url": customer.profile_photo_url,
            "role": customer.role,
            "is_active": customer.is_active,
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
        "payments": [
            {
                "payment_id": payment.id,
                "job_id": payment.job_id,
                "amount": payment.amount,
                "platform_fee": payment.platform_fee,
                "worker_amount": payment.worker_amount,
                "status": payment.status,
                "payment_reference": payment.payment_reference,
                "created_at": payment.created_at,
                "paid_at": payment.paid_at,
                "released_at": payment.released_at,
            }
            for payment in payments
        ],

        "worker_interactions": worker_interactions,

        "summary": {
            "total_jobs": len(jobs),
            "completed_jobs": sum(
                1
                for job in jobs
                if job.status == "completed"
            ),
            "pending_jobs": sum(
                1
                for job in jobs
                if job.status in {"pending", "open"}
            ),
            "assigned_jobs": sum(
                1
                for job in jobs
                if job.status == "assigned"
            ),
            "in_progress_jobs": sum(
                1
                for job in jobs
                if job.status == "in_progress"
            ),
            "total_spent": total_spent,
            "completed_payments": completed_payments,
            "pending_refunds": pending_refunds,
            "cancelled_jobs": cancelled_jobs,
            "total_spent": total_spent,
            "wallet_balance": customer_wallet_balance,
            "escrow_balance": escrow_balance,
            "completed_payments": completed_payments,
            "pending_refunds": pending_refunds,
        },
    }

@router.patch("/customers/{customer_id}/verify")
def admin_verify_customer(
    customer_id: str,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(User)
        .filter(
            User.id == customer_id,
            User.role == "customer",
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    customer.verification_status = "verified"

    db.commit()
    db.refresh(customer)

    return {
    "message": "Customer verified successfully",
    "customer": {
        "customer_id": customer.id,
        "full_name": customer.full_name,
        "verification_status": customer.verification_status,
        "is_active": customer.is_active,
    },
}

@router.patch("/customers/{customer_id}/suspend")
def admin_suspend_customer(
    customer_id: str,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(User)
        .filter(
            User.id == customer_id,
            User.role == "customer",
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    if customer.is_active is False:
        return {
            "message": "Customer is already suspended",
            "customer": {
                "customer_id": customer.id,
                "full_name": customer.full_name,
                "verification_status": customer.verification_status,
                "is_active": customer.is_active,
            },
        }

    customer.is_active = False

    db.commit()
    db.refresh(customer)

    return {
        "message": "Customer suspended successfully",
        "customer": {
            "customer_id": customer.id,
            "full_name": customer.full_name,
            "verification_status": customer.verification_status,
            "is_active": customer.is_active,
        },
    }

@router.patch("/customers/{customer_id}/reactivate")
def admin_reactivate_customer(
    customer_id: str,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(User)
        .filter(
            User.id == customer_id,
            User.role == "customer",
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    if customer.is_active is True:
        return {
            "message": "Customer is already active",
            "customer": {
                "customer_id": customer.id,
                "full_name": customer.full_name,
                "verification_status": customer.verification_status,
                "is_active": customer.is_active,
            },
        }

    customer.is_active = True

    db.commit()
    db.refresh(customer)

    return {
        "message": "Customer reactivated successfully",
        "customer": {
            "customer_id": customer.id,
            "full_name": customer.full_name,
            "verification_status": customer.verification_status,
            "is_active": customer.is_active,
        },
    }