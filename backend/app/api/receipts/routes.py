from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.receipt import ReceiptCreate, ReceiptResponse
from app.services.receipt_service import (
    create_receipt,
    get_receipts,
    get_receipt,
)

from fastapi.responses import FileResponse, HTMLResponse
import os

from app.models.receipt import Receipt

router = APIRouter(prefix="/receipts", tags=["Receipts"])


router = APIRouter(
    prefix="/receipts",
    tags=["Receipts"]
)


@router.post("/", response_model=ReceiptResponse)
def create_new_receipt(
    receipt: ReceiptCreate,
    db: Session = Depends(get_db)
):
    return create_receipt(db, receipt)


@router.get("/", response_model=list[ReceiptResponse])
def list_receipts(db: Session = Depends(get_db)):
    return get_receipts(db)


@router.get("/{receipt_id}", response_model=ReceiptResponse)
def receipt_detail(
    receipt_id: str,
    db: Session = Depends(get_db)
):
    receipt = get_receipt(db, receipt_id)

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    return receipt


@router.get("/verify/{receipt_number}", response_class=HTMLResponse)
def verify_receipt(receipt_number: str, db: Session = Depends(get_db)):
    receipt = db.query(Receipt).filter(
        Receipt.receipt_number == receipt_number
    ).first()

    if not receipt:
        return """
        <html>
            <body style="font-family: Arial; text-align:center; padding:40px;">
                <h1 style="color:red;">Invalid Receipt</h1>
                <p>This HelpNova receipt could not be verified.</p>
            </body>
        </html>
        """

    return f"""
    <html>
        <body style="font-family: Arial; text-align:center; padding:40px;">
            <h1>HELPNOVA</h1>
            <h2 style="color:green;">Receipt Verified</h2>
            <p><strong>Receipt No:</strong> {receipt.receipt_number}</p>
            <p><strong>Amount:</strong> NGN {receipt.amount:,.2f}</p>
            <p><strong>Platform Fee:</strong> NGN {receipt.platform_fee:,.2f}</p>
            <p><strong>Worker Amount:</strong> NGN {receipt.worker_amount:,.2f}</p>
            <p><strong>Status:</strong> {receipt.status}</p>
            <p><strong>Created At:</strong> {receipt.created_at}</p>
            <hr>
            <p>Authentic HelpNova Receipt</p>
        </body>
    </html>
    """


@router.get("/download/{receipt_number}")
def download_receipt(receipt_number: str, db: Session = Depends(get_db)):
    receipt = db.query(Receipt).filter(
        Receipt.receipt_number == receipt_number
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    pdf_path = os.path.join(
        "generated_receipts",
        f"{receipt.receipt_number}.pdf"
    )

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Receipt PDF file not found")

    return FileResponse(
        path=pdf_path,
        filename=f"{receipt.receipt_number}.pdf",
        media_type="application/pdf"
    )