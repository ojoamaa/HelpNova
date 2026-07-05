from datetime import datetime


def process_bank_payout(withdrawal):
    """
    Temporary payout processor.
    Later this will connect to Paystack/Monnify live transfer API.
    """

    payout_reference = f"PAYOUT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    return {
        "success": True,
        "provider": "manual",
        "reference": payout_reference,
        "message": "Payout processed successfully in manual mode."
    }
