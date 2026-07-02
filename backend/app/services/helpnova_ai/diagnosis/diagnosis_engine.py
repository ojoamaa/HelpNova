from app.services.helpnova_ai.diagnosis.service_classifier import ServiceClassifier
from app.services.helpnova_ai.diagnosis.followup_questions import FollowupQuestions
from app.services.helpnova_ai.diagnosis.urgency_estimator import UrgencyEstimator
from app.services.helpnova_ai.diagnosis.pricing_estimator import PricingEstimator
from app.services.helpnova_ai.diagnosis.conversation_builder import ConversationBuilder


class DiagnosisEngine:

    @classmethod
    def diagnose(cls, message: str):
        service = ServiceClassifier.classify(message)
        urgency = UrgencyEstimator.estimate(message)
        estimated_price = PricingEstimator.estimate(service)
        questions = FollowupQuestions.get_questions(service)

        job_draft = ConversationBuilder.build_job_draft(
            message,
            {
                "service": service,
                "urgency": urgency,
                "estimated_price": estimated_price
            }
        )

        return {
            "service": service,
            "urgency": urgency,
            "estimated_price": estimated_price,
            "followup_questions": questions,
            "job_draft": job_draft
        }