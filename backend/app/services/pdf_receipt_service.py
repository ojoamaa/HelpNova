import os
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


RECEIPT_DIR = "generated_receipts"


def generate_receipt_pdf(receipt):
    os.makedirs(RECEIPT_DIR, exist_ok=True)

    receipt_number = receipt.receipt_number
    verify_url = f"https://helpnova.com/verify/{receipt_number}"

    qr_path = os.path.join(RECEIPT_DIR, f"{receipt_number}_qr.png")
    pdf_path = os.path.join(RECEIPT_DIR, f"{receipt_number}.pdf")

    qr = qrcode.make(verify_url)
    qr.save(qr_path)

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 60, "HELPNOVA RECEIPT")

    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, height - 80, "Trusted Services on Demand")

    c.line(50, height - 100, width - 50, height - 100)

    y = height - 140

    def row(label, value):
        nonlocal y
        c.setFont("Helvetica-Bold", 11)
        c.drawString(60, y, label)
        c.setFont("Helvetica", 11)
        c.drawString(220, y, str(value))
        y -= 25

    row("Receipt No:", receipt.receipt_number)
    row("Payment ID:", receipt.payment_id)
    row("Job ID:", receipt.job_id)
    row("Customer ID:", receipt.customer_id)
    row("Worker ID:", receipt.worker_id)
    row("Amount Paid:", f"NGN {receipt.amount:,.2f}")
    row("Platform Fee:", f"NGN {receipt.platform_fee:,.2f}")
    row("Worker Amount:", f"NGN {receipt.worker_amount:,.2f}")
    row("Receipt Type:", receipt.receipt_type)
    row("Status:", receipt.status.upper())
    row("Created At:", receipt.created_at)

    y -= 20

    c.line(50, y, width - 50, y)
    y -= 40

    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width / 2, y, "Scan QR Code to Verify Receipt")

    y -= 180
    c.drawImage(qr_path, width / 2 - 75, y, width=150, height=150)

    y -= 30
    c.setFont("Helvetica", 9)
    c.drawCentredString(width / 2, y, verify_url)

    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(width / 2, 50, "Thank you for using HelpNova")

    c.save()

    return {
        "pdf_path": pdf_path,
        "qr_path": qr_path,
        "verify_url": verify_url
    }