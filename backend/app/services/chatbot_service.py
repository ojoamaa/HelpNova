def helpnova_chatbot_reply(message: str):
    text = message.lower().strip()

    if "payment" in text or "paid" in text or "escrow" in text:
        return {
            "intent": "payment_help",
            "reply": "You can check payment status, confirm paid payments, and release worker payments from the Payments section."
        }

    if "receipt" in text or "qr" in text or "verify" in text:
        return {
            "intent": "receipt_help",
            "reply": "Receipts can be downloaded or verified using the receipt number or QR code."
        }

    if "job" in text or "booking" in text or "service" in text:
        return {
            "intent": "job_help",
            "reply": "You can create jobs, track assigned jobs, complete jobs, and view completed service history."
        }

    if "worker" in text or "artisan" in text or "provider" in text:
        return {
            "intent": "worker_help",
            "reply": "Workers can view assigned jobs, completed jobs, earnings, wallet balance, and payout history."
        }

    if "wallet" in text or "earning" in text or "payout" in text:
        return {
            "intent": "wallet_help",
            "reply": "Worker wallet shows available balance, pending balance, total earned, and transaction history."
        }

    if "complaint" in text or "dispute" in text or "problem" in text:
        return {
            "intent": "dispute_help",
            "reply": "You can open a dispute for any job that needs review or resolution."
        }

    if "admin" in text or "dashboard" in text or "revenue" in text:
        return {
            "intent": "admin_help",
            "reply": "Admins can monitor customers, workers, jobs, payments, revenue, payouts, and disputes from the dashboard."
        }

    return {
        "intent": "general_help",
        "reply": "Hello, I am HelpNova Assistant. I can help with jobs, payments, receipts, workers, wallet, disputes, and admin dashboard support."
    }