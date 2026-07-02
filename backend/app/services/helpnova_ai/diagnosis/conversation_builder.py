class ConversationBuilder:

    @staticmethod
    def build_job_draft(message, diagnosis):
        service = diagnosis.get("service")
        urgency = diagnosis.get("urgency")
        estimated_price = diagnosis.get("estimated_price")

        return {
            "title": f"{service} Service Request",
            "description": message,
            "suggested_category": service,
            "urgency": urgency,
            "estimated_price": estimated_price,
            "status": "draft",
            "ready_to_create": False,
            "required_details": [
                "customer location",
                "preferred time",
                "phone number",
                "photo if available"
            ]
        }