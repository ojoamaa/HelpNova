from app.services.helpnova_ai.intent_detector import IntentDetector
from app.services.helpnova_ai.permission_engine import PermissionEngine
from app.services.helpnova_ai.agent_router import AgentRouter
from app.services.helpnova_ai.response_builder import ResponseBuilder
from app.services.helpnova_ai.database_tools import DatabaseTools
from app.services.helpnova_ai.diagnosis.diagnosis_engine import DiagnosisEngine
from app.services.helpnova_ai.conversation_state import ConversationStateManager
from app.services.helpnova_ai.conversation_flow import ConversationFlow
from app.services.job_service import create_job_from_ai
from app.services.auto_matching_service import auto_match_job
from app.services.job_dispatch_service import dispatch_to_top_workers


class HelpNovaAIEngine:

    def __init__(self):
        self.intent_detector = IntentDetector()

    def respond(
        self,
        message: str,
        role: str = "customer",
        user_id: str | None = None,
        worker_id: str | None = None,
        job_id: str | None = None,
        receipt_number: str | None = None,
        db=None,
    ):
        user_key = user_id or "guest"
        intent = self.intent_detector.detect(message)
        state = ConversationStateManager.get(user_key)

        if state and intent == "general":
            draft = state.get("job_draft")

            if not draft:
                ConversationStateManager.clear(user_key)
                return ResponseBuilder.error(
                    "Conversation draft not found. Please start again."
                )

            for field in draft.get("required_details", []):
                if field not in draft:
                    draft[field] = message
                    break

            state["job_draft"] = draft
            ConversationStateManager.save(user_key, state)

            question = ConversationFlow.next_question(user_key)

            if question:
                return ResponseBuilder.success(
                    intent="conversation",
                    message=question,
                    data=draft
                )

            return ResponseBuilder.success(
                intent="job_ready",
                message="Excellent. I have everything required. Shall I create your job now?",
                data=draft
            )

        if not PermissionEngine.allowed(role, intent):
            return ResponseBuilder.error(
                "You do not have permission to perform this action."
            )

        agent = AgentRouter.route(intent)

        if intent == "confirm" and state:
            draft = state.get("job_draft")

            if not draft:
                return ResponseBuilder.error("No job draft found to create.")

            job = create_job_from_ai(
                db=db,
                user_id=user_id,
                draft=draft
            )

            match_result = auto_match_job(
               db=db,
               job_id=job.id
           )

            dispatch_result = dispatch_to_top_workers(
               job=job,
               matching_result=match_result
           )

            ConversationStateManager.clear(user_key)

            return ResponseBuilder.success(
        intent="job_created",
        message="Excellent! Your request has been created successfully and nearby professionals are being matched.",
        data={
        "job": job,
        "matching": match_result,
        "dispatch": dispatch_result
}
      )

        if intent == "create_job":
            diagnosis = DiagnosisEngine.diagnose(message)

            ConversationStateManager.save(
                user_key,
                {
                    "intent": "create_job",
                    "diagnosis": diagnosis,
                    "job_draft": diagnosis.get("job_draft")
                }
            )

            return ResponseBuilder.success(
                intent="create_job",
                message="I understand your request. Let me gather a few more details before creating your job.",
                data=diagnosis
            )

        if intent == "wallet" and worker_id and db:
            wallet = DatabaseTools.get_worker_wallet(db, worker_id)

            if not wallet:
                return ResponseBuilder.error("Wallet not found.")

            return ResponseBuilder.success(
                intent="wallet",
                message="Wallet balance retrieved successfully.",
                data=wallet
            )

        if intent == "job_status" and user_id and db:
            jobs = DatabaseTools.get_customer_jobs(db, user_id)

            return ResponseBuilder.success(
                intent="job_status",
                message="Jobs retrieved successfully.",
                data=jobs
            )

        if intent == "jobs" and user_id and db:
            jobs = DatabaseTools.get_customer_jobs(db, user_id)

            return ResponseBuilder.success(
                intent="jobs",
                message=f"{len(jobs)} jobs found.",
                data=jobs
            )

        if intent == "payment" and job_id and db:
            payment = DatabaseTools.get_payment_by_job(db, job_id)

            if not payment:
                return ResponseBuilder.error("No payment found for this job.")

            return ResponseBuilder.success(
                intent="payment",
                message="Payment details retrieved successfully.",
                data=payment
            )

        if intent == "receipt" and receipt_number and db:
            receipt = DatabaseTools.get_receipt_by_number(db, receipt_number)

            if not receipt:
                return ResponseBuilder.error("Receipt not found.")

            return ResponseBuilder.success(
                intent="receipt",
                message="Receipt retrieved successfully.",
                data=receipt
            )

        return ResponseBuilder.success(
              intent=intent,
              message=f"Request routed to {agent}. Live action support is being expanded.",
              data={"agent": agent}
        )