from app.models.job import Job
from app.models.worker import Worker
from app.models.job_review import JobReview


def submit_job_review(db, job_id: str, customer_id: str, rating: int, review: str | None = None):
    if rating < 1 or rating > 5:
        return {
            "success": False,
            "message": "Rating must be between 1 and 5."
        }

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {
            "success": False,
            "message": "Job not found."
        }

    if job.customer_id != customer_id:
        return {
            "success": False,
            "message": "This job does not belong to this customer."
        }

    if job.status != "completed":
        return {
            "success": False,
            "message": "Only completed jobs can be reviewed."
        }

    if not job.assigned_worker_id:
        return {
            "success": False,
            "message": "No worker assigned to this job."
        }

    existing_review = (
        db.query(JobReview)
        .filter(JobReview.job_id == job_id)
        .first()
    )

    if existing_review:
        return {
            "success": False,
            "message": "This job has already been reviewed."
        }

    job_review = JobReview(
        job_id=job.id,
        customer_id=customer_id,
        worker_id=job.assigned_worker_id,
        rating=rating,
        review=review
    )

    db.add(job_review)

    worker = db.query(Worker).filter(Worker.id == job.assigned_worker_id).first()

    if worker:
        total_reviews = (
            db.query(JobReview)
            .filter(JobReview.worker_id == worker.id)
            .count()
        )

        old_total = (worker.average_rating or 0) * total_reviews
        new_average = (old_total + rating) / (total_reviews + 1)

        worker.average_rating = round(new_average, 2)

    db.commit()
    db.refresh(job_review)

    return {
        "success": True,
        "message": "Review submitted successfully.",
        "review": job_review
    }
