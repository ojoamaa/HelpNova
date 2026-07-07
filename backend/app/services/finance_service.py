from datetime import datetime
from sqlalchemy.orm import Session

from app.models.withdrawal import Withdrawal
from app.models.wallet import Wallet, WalletTransaction


class FinanceService:
    def __init__(self, db: Session):
        self.db = db

    def get_pending_withdrawals(self):
        return (
            self.db.query(Withdrawal)
            .filter(Withdrawal.status == "pending")
            .order_by(Withdrawal.requested_at.desc())
            .all()
        )

    def get_all_withdrawals(self):
        return (
            self.db.query(Withdrawal)
            .order_by(Withdrawal.requested_at.desc())
            .all()
        )

    def approve_withdrawal(self, withdrawal_id: str, admin_id: str = "admin"):
        withdrawal = (
            self.db.query(Withdrawal)
            .filter(Withdrawal.id == withdrawal_id)
            .first()
        )

        if not withdrawal:
            return None

        if withdrawal.status != "pending":
            return "invalid_status"

        withdrawal.status = "approved"
        withdrawal.approved_by = admin_id
        withdrawal.approved_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(withdrawal)

        return withdrawal

    def reject_withdrawal(self, withdrawal_id: str, admin_id: str = "admin"):
        withdrawal = (
            self.db.query(Withdrawal)
            .filter(Withdrawal.id == withdrawal_id)
            .first()
        )

        if not withdrawal:
            return None

        if withdrawal.status != "pending":
            return "invalid_status"

        withdrawal.status = "rejected"
        withdrawal.rejected_by = admin_id
        withdrawal.rejected_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(withdrawal)

        return withdrawal

    def mark_withdrawal_paid(self, withdrawal_id: str, admin_id: str = "admin"):
        withdrawal = (
            self.db.query(Withdrawal)
            .filter(Withdrawal.id == withdrawal_id)
            .first()
        )

        if not withdrawal:
            return None

        if withdrawal.status != "approved":
            return "not_approved"

        wallet = (
            self.db.query(Wallet)
            .filter(Wallet.worker_id == withdrawal.worker_id)
            .first()
        )

        if not wallet:
            return "wallet_not_found"

        amount = float(withdrawal.amount or 0)

        if wallet.available_balance < amount:
            return "insufficient_balance"

        wallet.available_balance -= amount
        wallet.updated_at = datetime.utcnow()

        withdrawal.status = "paid"
        withdrawal.paid_by = admin_id
        withdrawal.paid_at = datetime.utcnow()

        tx = WalletTransaction(
            wallet_id=wallet.id,
            worker_id=withdrawal.worker_id,
            transaction_type="withdrawal_paid",
            amount=amount,
            status="success",
            description="Withdrawal paid to worker bank account",
            reference=withdrawal.reference,
            balance_after=wallet.available_balance,
        )

        self.db.add(tx)
        self.db.commit()
        self.db.refresh(withdrawal)

        return withdrawal

    def get_finance_summary(self):
        withdrawals = self.db.query(Withdrawal).all()
        wallets = self.db.query(Wallet).all()

        return {
            "total_wallet_balance": sum(w.available_balance or 0 for w in wallets),
            "total_pending_escrow": sum(w.pending_balance or 0 for w in wallets),
            "total_worker_earned": sum(w.total_earned or 0 for w in wallets),
            "pending_withdrawals": sum(
                w.amount or 0 for w in withdrawals if w.status == "pending"
            ),
            "approved_withdrawals": sum(
                w.amount or 0 for w in withdrawals if w.status == "approved"
            ),
            "paid_withdrawals": sum(
                w.amount or 0 for w in withdrawals if w.status == "paid"
            ),
            "withdrawal_count": len(withdrawals),
        }