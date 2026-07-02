def notify_customer_job_accepted(job, worker_id: str):
    return {
        "notification_type": "job_accepted",
        "customer_id": job.customer_id,
        "job_id": job.id,
        "worker_id": worker_id,
        "message": "A verified professional has accepted your request and will attend to you."
    }


def notify_customer_job_rejected(job_id: str, worker_id: str):
    return {
        "notification_type": "job_rejected",
        "job_id": job_id,
        "worker_id": worker_id,
        "message": "The professional declined. We are moving your request to the next available professional."
    }
