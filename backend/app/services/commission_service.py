WORKER_COMMISSION = 0.10
CUSTOMER_SERVICE_FEE = 0.05
CALLOUT_PLATFORM_FEE = 1000


def calculate_commission(job_amount: float):

    customer_fee = job_amount * CUSTOMER_SERVICE_FEE
    worker_commission = job_amount * WORKER_COMMISSION

    worker_amount = job_amount - worker_commission
    total_customer_payment = job_amount + customer_fee

    platform_income = customer_fee + worker_commission

    return {
        "job_amount": job_amount,
        "customer_fee": customer_fee,
        "worker_commission": worker_commission,
        "worker_receives": worker_amount,
        "customer_pays": total_customer_payment,
        "platform_revenue": platform_income
    }