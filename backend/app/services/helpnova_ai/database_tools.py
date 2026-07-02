from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.payment import Payment
from app.models.wallet import Wallet
from app.models.receipt import Receipt


class DatabaseTools:

    @staticmethod
    def get_customer_jobs(db: Session, customer_id: str):
        jobs = (
            db.query(Job)
            .filter(Job.customer_id == customer_id)
            .all()
        )

        return [
            {
                "job_id": job.id,
                "title": job.title,
                "description": job.description,
                "status": job.status,
                "city": job.city,
                "area": job.area,
                "created_at": job.created_at,
            }
            for job in jobs
        ]

    @staticmethod
    def get_customer_jobs(db: Session, customer_id: str):
        jobs = db.query(Job).filter(Job.customer_id == customer_id).all()

        return [
            {
                "job_id": job.id,
                "title": job.title,
                "status": job.status,
                "city": job.city,
                "area": job.area,
                "created_at": job.created_at,
            }
            for job in jobs
        ]

    @staticmethod
    def get_payment_by_job(db: Session, job_id: str):
        payment = (
            db.query(Payment)
            .filter(Payment.job_id == job_id)
            .order_by(Payment.created_at.desc())
            .first()
        )

        if not payment:
            return None

        return {
            "payment_id": payment.id,
            "status": payment.status,
            "amount": payment.amount,
            "platform_fee": payment.platform_fee,
            "worker_amount": payment.worker_amount,
            "payment_reference": payment.payment_reference,
        }

    @staticmethod
    def get_receipt_by_number(db: Session, receipt_number: str):
        receipt = (
            db.query(Receipt)
            .filter(Receipt.receipt_number == receipt_number)
            .first()
        )

        if not receipt:
            return None

        return {
            "receipt_number": receipt.receipt_number,
            "amount": receipt.amount,
            "status": receipt.status,
            "receipt_type": receipt.receipt_type,
            "created_at": receipt.created_at,
        }
